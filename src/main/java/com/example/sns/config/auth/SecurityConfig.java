package com.example.sns.config.auth;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.sns.exception.ErrorCode;
import com.example.sns.exception.ErrorResponse;
import com.example.sns.security.JwtAuthenticationFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Spring Security 설정.
 *
 * 보안 헤더 및 Actuator 제한 (RULE 1.6.1).
 * JWT 인증 필터 적용 (Step 6).
 * Step 7: /api/admin/** ROLE_ADMIN, deny-by-default, CORS allow-list, 403 로깅.
 */
@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsProperties corsProperties;
    private final ObjectMapper objectMapper;

    /** H2 콘솔 전용: 인라인 스크립트 허용(CSP 완화). No Javascript 메시지 방지. */
    @Bean
    @Order(1)
    @Profile("dev")
    public SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/h2-console", "/h2-console/**")
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'")))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives(
                                        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'")))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/h2-console", "/h2-console/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/actuator/**").denyAll()
                        .requestMatchers("/api/auth/login", "/api/auth/refresh", "/api/auth/logout").permitAll()
                        .requestMatchers("/api/members").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/me", "/api/me/**").authenticated()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/sample/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/posts", "/api/posts/*")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/posts").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/posts/*").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/posts/*").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/image-posts",
                                "/api/image-posts/*", "/api/image-posts/*/image")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/image-posts").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/image-posts/*").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/image-posts/*")
                        .authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/map/directions").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/pins/nearby").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/pins/*/posts",
                                "/api/pins/*/image-posts")
                        .permitAll()
                        .requestMatchers("/api/pins", "/api/pins/**").authenticated()
                        // Like
                        .requestMatchers(HttpMethod.POST, "/api/posts/*/like").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/posts/*/like").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/profile/liked-post-ids").authenticated()
                        // Follow
                        .requestMatchers(HttpMethod.POST, "/api/users/*/follow").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/users/*/follow").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/profile/following-ids").authenticated()
                        // Users (public)
                        .requestMatchers(HttpMethod.GET, "/api/users/search").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/*").permitAll()
                        // Notifications
                        .requestMatchers("/api/notifications", "/api/notifications/**").authenticated()
                        // Saved Routes
                        .requestMatchers("/api/saved-routes", "/api/saved-routes/**").authenticated()
                        // Route proxy
                        .requestMatchers(HttpMethod.GET, "/api/route").permitAll()
                        .requestMatchers("/error", "/favicon.ico").permitAll()
                        // CORS preflight (OPTIONS) 는 모든 경로에서 허용 — Spring Security 체인 도달 전 차단 방지
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().denyAll())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((HttpServletRequest request, HttpServletResponse response,
                                org.springframework.security.core.AuthenticationException authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            ErrorResponse err = ErrorResponse.of(ErrorCode.UNAUTHORIZED, request);
                            response.getWriter().write(objectMapper.writeValueAsString(err));
                        })
                        .accessDeniedHandler(accessDeniedHandler()));

        return http.build();
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (HttpServletRequest request, HttpServletResponse response,
                org.springframework.security.access.AccessDeniedException accessDeniedException) -> {
            log.warn("인가 실패(403): path={}, principal={}, message={}",
                    request.getRequestURI(),
                    request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "anonymous",
                    accessDeniedException.getMessage());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            ErrorResponse errorResponse = ErrorResponse.of(ErrorCode.FORBIDDEN, request);
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> patterns = corsProperties.getAllowedOriginPatterns();
        if (patterns != null && !patterns.isEmpty()) {
            config.setAllowedOriginPatterns(patterns);
        } else {
            List<String> origins = corsProperties.getAllowedOrigins();
            if (origins != null && !origins.isEmpty()) {
                config.setAllowedOrigins(origins);
            }
        }
        config.setAllowedMethods(List.of(HttpMethod.GET.name(), HttpMethod.POST.name(),
                HttpMethod.PUT.name(), HttpMethod.PATCH.name(), HttpMethod.DELETE.name(), HttpMethod.OPTIONS.name()));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "X-Refresh-Token", "X-Trace-Id"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
