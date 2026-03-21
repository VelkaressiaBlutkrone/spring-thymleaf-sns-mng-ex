package com.example.sns.security;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.sns.config.ratelimit.RateLimitProperties;
import com.example.sns.exception.ErrorCode;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Rate Limiting 필터 (RULE 1.9, Step 18).
 *
 * 로그인·회원가입·토큰 갱신·비인증 공개 API에 IP 기준 제한 적용.
 * 초과 시 429 Too Many Requests + Retry-After 헤더 반환.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private static final List<String> AUTH_RATE_LIMIT_PATHS = List.of(
            "POST:/api/auth/login",
            "POST:/api/members",
            "POST:/api/auth/refresh");

    private static final Pattern PIN_POSTS_PATTERN = Pattern.compile("/api/pins/\\d+/posts");
    private static final Pattern PIN_IMAGE_POSTS_PATTERN = Pattern.compile("/api/pins/\\d+/image-posts");

    private final RateLimitProperties props;
    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .maximumSize(100_000)
            .expireAfterAccess(Duration.ofMinutes(10))
            .build();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        return !isRateLimitedPath(method, path);
    }

    /** RULE 1.9: 인증 API + 비인증 공개 API Rate Limiting 대상 여부. */
    private boolean isRateLimitedPath(String method, String path) {
        if (AUTH_RATE_LIMIT_PATHS.contains(method + ":" + path)) {
            return true;
        }
        if (!"GET".equals(method)) {
            return false;
        }
        if (path.startsWith("/api/posts") || path.startsWith("/api/image-posts")) {
            return true;
        }
        if ("/api/pins/nearby".equals(path)) {
            return true;
        }
        if (PIN_POSTS_PATTERN.matcher(path).matches() || PIN_IMAGE_POSTS_PATTERN.matcher(path).matches()) {
            return true;
        }
        return "/api/map/directions".equals(path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientKey = resolveClientKey(request);

        Bucket bucket = bucketFor(path, method, clientKey);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (!probe.isConsumed()) {
            long retryAfterSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            if (retryAfterSeconds <= 0) {
                retryAfterSeconds = 1;
            }
            response.setStatus(429); // Too Many Requests (RULE 1.9)
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType("application/json;charset=UTF-8");
            String body = "{\"code\":\"%s\",\"message\":\"%s\"}".formatted(
                    ErrorCode.TOO_MANY_REQUESTS.getCode(),
                    ErrorCode.TOO_MANY_REQUESTS.getDefaultMessage());
            response.getWriter().write(body);
            log.warn("Rate limit exceeded: method={}, path={}, clientKey={}, retryAfterSec={}",
                    method, path, maskForLog(clientKey), retryAfterSeconds);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Bucket bucketFor(String path, String method, String clientKey) {
        String bucketKey = bucketKey(path, method, clientKey);
        return buckets.get(bucketKey, k -> buildBucket(path, method));
    }

    private String bucketKey(String path, String method, String clientKey) {
        if ("/api/auth/login".equals(path) && "POST".equals(method)) {
            return "login:" + clientKey;
        }
        if ("/api/members".equals(path) && "POST".equals(method)) {
            return "signup:" + clientKey;
        }
        if ("/api/auth/refresh".equals(path) && "POST".equals(method)) {
            return "refresh:" + clientKey;
        }
        return "public:" + clientKey;
    }

    private Bucket buildBucket(String path, String method) {
        Bandwidth bandwidth;
        if ("/api/auth/login".equals(path) && "POST".equals(method)) {
            bandwidth = Bandwidth.simple(props.loginCapacity(), Duration.ofMinutes(props.loginPeriodMinutes()));
        } else if ("/api/members".equals(path) && "POST".equals(method)) {
            bandwidth = Bandwidth.simple(props.signupCapacity(), Duration.ofMinutes(props.signupPeriodMinutes()));
        } else if ("/api/auth/refresh".equals(path) && "POST".equals(method)) {
            bandwidth = Bandwidth.simple(props.refreshCapacity(),
                    Duration.ofMinutes(props.refreshPeriodMinutes()));
        } else {
            bandwidth = Bandwidth.simple(props.publicApiCapacity(),
                    Duration.ofMinutes(props.publicApiPeriodMinutes()));
        }
        return Bucket.builder().addLimit(bandwidth).build();
    }

    /**
     * 클라이언트 IP 결정.
     * X-Forwarded-For를 직접 신뢰하지 않고 getRemoteAddr()을 사용.
     * 리버스 프록시 환경에서는 server.forward-headers-strategy=NATIVE 설정 필요.
     */
    private String resolveClientKey(HttpServletRequest request) {
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    /** 로그용 마스킹: IP 일부만 노출 (RULE 1.4.3 민감정보 최소화). */
    private static String maskForLog(String clientKey) {
        if (clientKey == null || clientKey.length() < 8) {
            return "***";
        }
        return clientKey.substring(0, Math.min(4, clientKey.length())) + "***";
    }
}
