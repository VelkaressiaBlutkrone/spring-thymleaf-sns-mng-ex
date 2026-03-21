# Code Review Report

**프로젝트:** spring-react-flutter-sns-mng
**리뷰 일자:** 2026-03-21
**리뷰 대상:** 전체 코드베이스 (Spring Boot 90+파일, Web 26파일, Mobile 9파일)

---

## 📊 전체 리뷰 요약

| 등급 | Spring Boot | Web (React) | Mobile (Flutter) | 합계 |
|------|:-----------:|:-----------:|:----------------:|:----:|
| 🔴 Critical | 5건 | 0건 | 0건 | **5건** |
| 🟡 HIGH | 12건 | 4건 *(수정완료)* | 4건 *(수정완료)* | **20건** |
| 🟡 MEDIUM | 22건 | 7건 | 4건 | **33건** |
| 🟢 Minor | 11건 | 5건 | 3건 | **19건** |
| ✅ 잘된 점 | 19건 | 6건 | 5건 | **30건** |

**결론: 🔴 Critical 5건 (Spring Boot 보안) 즉시 수정 필요**

> Web/Mobile의 HIGH 이슈 8건은 커밋 `547ca1f`에서 수정 완료됨

---

# Part 1. Spring Boot 백엔드

---

## 🔴 Critical (즉시 수정 필요)

### S-C1. X-Forwarded-For IP 스푸핑으로 Rate Limit 우회

**위치:** `security/RateLimitFilter.java:138-143`
**문제:** `X-Forwarded-For` 헤더를 무조건 신뢰하여 클라이언트 IP를 결정. 공격자가 매 요청마다 헤더를 변경하면 Rate Limiting이 완전히 무력화됨 (로그인 브루트포스, 회원가입 남용 등)

**Before:**
```java
private String resolveClientKey(HttpServletRequest request) {
    String xff = request.getHeader("X-Forwarded-For");
    if (xff != null && !xff.isBlank()) {
        return xff.split(",")[0].trim();
    }
    return request.getRemoteAddr();
}
```

**After:**
```java
// server.forward-headers-strategy=NATIVE 설정 후
// 신뢰할 수 있는 프록시의 헤더만 getRemoteAddr()에 반영됨
private String resolveClientKey(HttpServletRequest request) {
    return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
}
```

---

### S-C2. Rate Limit 버킷 메모리 무한 성장 (OOM)

**위치:** `security/RateLimitFilter.java:45`
**문제:** `ConcurrentHashMap<String, Bucket>`에 만료/퇴거 없음. 고유 IP(또는 스푸핑된 XFF)마다 영구 버킷 생성 → OutOfMemoryError

**Before:**
```java
private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
```

**After:**
```java
private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
    .maximumSize(100_000)
    .expireAfterAccess(Duration.ofMinutes(10))
    .build();
```

---

### S-C3. HTTP Header Injection via Content-Disposition filename

**위치:** `controller/api/ImagePostController.java:93`
**문제:** 파일명에 CRLF 문자가 포함되면 HTTP Response Splitting 공격 가능

**Before:**
```java
.header(HttpHeaders.CONTENT_DISPOSITION,
    "inline; filename=\"" + resource.getFilename() + "\"")
```

**After:**
```java
String safeName = (resource.getFilename() != null)
    ? resource.getFilename().replaceAll("[\\r\\n\"\\\\]", "_")
    : "image";
.header(HttpHeaders.CONTENT_DISPOSITION,
    "inline; filename=\"" + safeName + "\"")
```

---

### S-C4. 비인증 엔드포인트에서 입력값 파싱 미검증 (DoS)

**위치:** `controller/api/MapController.java:90-95`
**문제:** `/api/route` (permitAll)에서 `origin`/`destination`을 쉼표 split + `Double.parseDouble()` 직접 호출. 잘못된 입력 시 `NumberFormatException`/`ArrayIndexOutOfBoundsException`이 500 에러로 노출

**Before:**
```java
String[] orig = origin.split(",");
double originLng = Double.parseDouble(orig[0].trim());
```

**After:**
```java
try {
    String[] orig = origin.split(",");
    if (orig.length < 2) return ResponseEntity.badRequest().body(Map.of("error", "형식: lng,lat"));
    double originLng = Double.parseDouble(orig[0].trim());
    // ...
} catch (NumberFormatException e) {
    return ResponseEntity.badRequest().body(Map.of("error", "좌표는 숫자여야 합니다."));
}
```

---

### S-C5. BaseEntity @PrePersist/@PreUpdate 미사용 — createdAt null 위험

**위치:** `domain/BaseEntity.java:22-30`
**문제:** `onCreate()`/`onUpdate()`가 JPA 콜백이 아닌 수동 호출 방식. 개발자가 호출을 누락하면 `NOT NULL` 제약 위반으로 런타임 예외

**Before:**
```java
protected void onCreate() { /* 수동 호출 필요 */ }
```

**After:**
```java
@PrePersist
protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
}

@PreUpdate
protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
}
```

---

## 🟡 HIGH (수정 권고)

### S-H1. 하드코딩된 JWT Secret (dev 프로필)

**위치:** `application-dev.yml:69`
**문제:** `local-secret-key-min-256-bits-for-hs256-encoding` 폴백값. 소스 코드 읽으면 토큰 위조 가능

---

### S-H2. H2 Console SecurityFilterChain에 @Profile("dev") 누락

**위치:** `config/auth/SecurityConfig.java:51-59`
**문제:** 프로덕션에서 H2 의존성 제외 안 하면 콘솔 노출. `@Profile("dev")` 가드 필요

---

### S-H3. 페이지 크기(size) 상한 제한 없음 — OOM 가능

**위치:** 모든 컨트롤러 페이지네이션 엔드포인트
**문제:** `?size=999999` 요청 시 거대 결과셋 메모리 로딩

**개선:** `Math.min(size, 100)` 또는 `spring.data.web.pageable.max-page-size=100`

---

### S-H4. N+1 쿼리 — Response DTO에서 LAZY 연관 엔티티 접근

**위치:** `PostResponse.from()`, `ImagePostResponse.from()`, `PinResponse.from()`, `NotificationResponse.from()`
**문제:** `post.getAuthor().getNickname()` 등 LAZY 프록시 접근 → 리스트 조회 시 N+1

**개선:** Repository에 `@EntityGraph(attributePaths = {"author"})` 추가

---

### S-H5. 알림 조회 페이지네이션 없음

**위치:** `service/NotificationService.java:39-45`
**문제:** `List<NotificationResponse>` 전체 반환. 수천 건 알림 시 성능 저하

---

### S-H6. 저장 경로 조회 페이지네이션 없음

**위치:** `service/SavedRouteService.java:45-51`
**문제:** 동일 패턴

---

### S-H7. AdminStatsService에 @Transactional(readOnly=true) 클래스 레벨 누락

**위치:** `service/AdminStatsService.java:35`

---

### S-H8. 트랜잭션 내 파일 I/O — 고아 파일 위험

**위치:** `service/ImagePostService.java:86-103`
**문제:** `@Transactional` 내에서 파일 저장 후 DB 저장 실패 시 디스크에 파일만 남음

**개선:** `TransactionSynchronization.afterCompletion(ROLLED_BACK)` 시 파일 삭제

---

### S-H9. 모든 엔티티에 equals()/hashCode() 미구현

**위치:** User, Post, ImagePost, Pin, Follow, PostLike, Notification, SavedRoute
**문제:** Set/Map에서 예기치 않은 동작, detached 엔티티 비교 문제

---

### S-H10. NotificationResponse LAZY 프록시 3중 접근으로 N+1 증폭

**위치:** `dto/response/NotificationResponse.java:19-31`
**문제:** `n.getUser()`, `n.getFromUser()`의 3개 필드 접근 → 알림 수 x 2 추가 쿼리

---

### S-H11. Location VO 좌표 범위 검증 부재

**위치:** `domain/Location.java:25-28`
**문제:** 위도 999, 경도 -999 같은 무효 좌표 저장 가능

---

### S-H12. Rate Limit 경로 매칭에 매 요청마다 Regex 컴파일

**위치:** `security/RateLimitFilter.java:68`
**문제:** `path.matches(...)` 호출마다 Pattern 재생성. 사전 컴파일 필요

---

## 🟡 MEDIUM (수정 권고)

### S-M1. 로그인 실패 로그에 이메일 전문 노출 (PII)

**위치:** `service/AuthService.java:55-60`
**문제:** GDPR 등 데이터 보호 규정 위반 가능

---

### S-M2. 로그인 성공 로그에도 이메일 노출

**위치:** `service/AuthService.java:72`

---

### S-M3. Refresh Token 파싱 시 NumberFormatException 미처리

**위치:** `service/AuthService.java:105`
**문제:** 500 에러 대신 401로 처리해야 함

---

### S-M4. TraceIdFilter가 외부 X-Trace-Id를 검증 없이 수용 (로그 인젝션)

**위치:** `config/tracing/TraceIdFilter.java:34-37`
**문제:** 개행/특수 문자 포함 가능 → 로그 조작

---

### S-M5. GlobalExceptionHandler 중복 검증 로직 (DRY 위반)

**위치:** `exception/GlobalExceptionHandler.java:45-70`

---

### S-M6. CORS allowed-origins 프로덕션 기본값 비어 있음

**위치:** `application-prod.yml:66`
**문제:** 환경변수 미설정 시 모든 CORS 요청 차단 (fail-closed이지만 사일런트 장애)

---

### S-M7. FollowController/PostLikeController NullPointerException 가능

**위치:** `controller/api/FollowController.java:31`, `PostLikeController.java:31`
**문제:** `@AuthenticationPrincipal`이 null일 수 있는데 직접 접근

---

### S-M8. 인증 처리 패턴 불일치 (2가지 패턴 혼재)

**위치:** 일부는 `@AuthenticationPrincipal`, 일부는 `authService.getCurrentUserEntity()`
**개선:** 하나로 통일

---

### S-M9. 자기 자신에게 좋아요 가능

**위치:** `service/PostLikeService.java:31-43`
**문제:** `FollowService`에는 자기 팔로우 방지가 있으나 좋아요에는 없음

---

### S-M10. MapController 내부에 record DTO 정의

**위치:** `controller/api/MapController.java:72-76`
**문제:** 다른 컨트롤러는 별도 DTO 사용. 일관성 없음

---

### S-M11. `routeProxy()` 와일드카드 반환 `ResponseEntity<?>`

**위치:** `controller/api/MapController.java:83`
**문제:** Swagger 문서에 응답 스키마 미생성

---

### S-M12. ImagePostController `create()` 파라미터 7개 과다

**위치:** `controller/api/ImagePostController.java:100-106`
**개선:** DTO 객체 + `@ModelAttribute` 사용

---

### S-M13. ImagePostController 검증 로직 3곳 분산 (DRY 위반)

**위치:** `ImagePostController.java:126,148`, `AdminImagePostController.java:66`

---

### S-M14. Post와 ImagePost 엔티티 코드 중복

**위치:** `domain/Post.java`, `domain/ImagePost.java`
**문제:** author, title, content, lat/lng, pin, isAuthor() 등 거의 동일 필드/메서드

---

### S-M15. 인덱스 미설정 — 빈번 조회 FK/검색 컬럼

**위치:** posts.user_id, pins.user_id, pins.lat/lng, notifications.user_id, post_likes 등
**개선:** `@Table(indexes = @Index(...))`

---

### S-M16. Notification.isRead Lombok @Getter 네이밍 충돌

**위치:** `domain/Notification.java:44`
**문제:** `boolean isRead` → Lombok이 `isIsRead()` 생성

---

### S-M17. Post.update() null 검증 없이 필드 덮어쓰기

**위치:** `domain/Post.java:76-86`

---

### S-M18. LoginRequest 이메일 형식 검증 누락

**위치:** `dto/request/LoginRequest.java:12`
**문제:** `@Email` 없이 잘못된 형식도 DB 조회까지 진행

---

### S-M19. PinCreateRequest 위도/경도 범위 검증 누락

**위치:** `dto/request/PinCreateRequest.java:11-15`
**문제:** `@DecimalMin`/`@DecimalMax` 없음

---

### S-M20. NotificationRepository.markAllAsRead() clearAutomatically 누락

**위치:** `repository/NotificationRepository.java:17-19`
**문제:** `@Modifying` 벌크 업데이트 후 영속성 컨텍스트 stale data

---

### S-M21. AdminStatsController.parseRange() 에러 메시지 없는 400

**위치:** `controller/api/AdminStatsController.java:39-41`

---

### S-M22. @Transactional(readOnly=true) 읽기 메서드 중복 선언

**위치:** PostService, ImagePostService 등 (클래스 레벨 + 메서드 레벨 중복)

---

## 🟢 Minor (선택적 수정)

### S-L1. AuthController.me() 매직 넘버 401

**위치:** `controller/api/AuthController.java:80`
**개선:** `HttpStatus.UNAUTHORIZED` 사용

---

### S-L2. JwtConfig 클래스명이 실제 책임과 불일치

**위치:** `config/auth/JwtConfig.java` — JWT 외에 CORS, Upload, RateLimit Properties도 활성화

---

### S-L3. BusinessException message 필드 중복

**위치:** `exception/BusinessException.java:15` — `Throwable.detailMessage`와 중복

---

### S-L4. Swagger @Tag/@Operation 일부 컨트롤러 누락

**위치:** FollowController, PostLikeController, NotificationController, SavedRouteController, UserController

---

### S-L5. PostLikeService.isLikedByUser() 불필요한 User 엔티티 조회

**위치:** `service/PostLikeService.java:60-65`
**개선:** `existsByUser_IdAndPost()` 쿼리로 SELECT 1회 절약

---

### S-L6. FollowService.getPublicProfile() SRP 위반 경향

**위치:** `service/FollowService.java:70-79`
**문제:** 팔로우 서비스에 프로필 조회 기능 존재

---

### S-L7. UserController.searchUsers() 검색어 길이 제한 없음

**위치:** `controller/api/UserController.java:27`

---

### S-L8. LoginLog BaseEntity 미상속 — 감사 패턴 불일치

**위치:** `domain/LoginLog.java:23`

---

### S-L9. LoginLog.of()에서 LocalDateTime.now() 직접 호출

**위치:** `domain/LoginLog.java:37-39`
**문제:** 테스트 시 시간 제어 불가

---

### S-L10. MemberResponse/UserProfileResponse 역할 중복

**위치:** `dto/response/MemberResponse.java`, `dto/response/UserProfileResponse.java`

---

### S-L11. PinResponse @JsonProperty 별칭으로 JSON 중복 필드 노출

**위치:** `dto/response/PinResponse.java:25-43`
**문제:** `ownerId`와 `userId`, `latitude`와 `lat`이 동시 출력

---

## ✅ 잘된 점

### Spring Boot 백엔드

1. **Deny-by-default 보안 설정** — `SecurityConfig`이 `.anyRequest().denyAll()`로 종료. 새 엔드포인트는 명시적 허용 필요
2. **쿠키 보안 속성 완비** — HttpOnly, Secure, SameSite=Strict 올바르게 설정
3. **JWT 블랙리스트 on 로그아웃** — `jti` 기반 토큰 무효화로 재사용 방지
4. **traceId 기반 요청 추적** — 모든 로그에 traceId 포함, finally 블록에서 MDC 정리
5. **구조화된 에러 응답** — timestamp, path, traceId, code 포함한 일관된 ErrorResponse
6. **인증 엔드포인트 Rate Limiting** — login, signup, token refresh에 Bucket4j 적용
7. **종합적 예외 처리** — GlobalExceptionHandler가 검증, 인증, 인가, DB, catch-all 커버
8. **프로필 기반 Redis 분리** — `@Profile("!test")`로 테스트 환경에서 Redis 불필요
9. **Actuator 잠금** — health, info만 노출. 나머지 denyAll
10. **일관된 소유권 검증 (IDOR 방지)** — 수정/삭제 시 `isAuthor()`/`isOwner()` 검증 + 경고 로그
11. **생성자 주입 100%** — 모든 서비스/컨트롤러에서 `@RequiredArgsConstructor`. 필드 주입 0건
12. **Entity 직접 반환 없음** — 전용 DTO 사용. Mass Assignment 방지
13. **FileStorageService 보안** — Path Traversal 방지, MIME 검증, UUID 파일명
14. **@AuditLog 감사 로그** — 관리자/민감 작업에 AOP 감사 적용
15. **Optional.get() 직접 호출 0건** — 모든 곳에서 `orElseThrow()` 사용
16. **BCrypt 비밀번호 해싱** — PasswordEncoder 적용
17. **경로 기반 Admin 접근 제어** — `/api/admin/**`에 `hasRole("ADMIN")`
18. **LAZY 로딩 일관 적용** — 모든 `@ManyToOne`이 FetchType.LAZY
19. **엔티티 비즈니스 로직 배치** — isAuthor(), markAsRead() 등 도메인 로직이 엔티티 내부에 위치 (Rich Domain Model)

---

# Part 2. Web (React/TypeScript) — 수정 완료

> H-1~H-4, M-1, M-7, M-8 이슈는 커밋 `547ca1f`에서 수정 완료

### 잔여 MEDIUM 이슈
- M-3. useMapSNS.ts 780줄 God Hook (SRP 위반)
- M-4. App.tsx 1043줄 God Component
- M-5. `any` 타입 25+ 남용
- M-6. useEffect 의존성 배열 불완전
- M-9. About 탭 인증 redirect 불일치
- M-10. 마이페이지 페이지네이션 미지원
- M-11. 전역 변수 Repository 접근

### 잘된 점 (6건)
디자인 토큰 마이그레이션 일관성, CSS 변수 브랜드 팔레트, 접근성(prefers-reduced-motion), 방어적 API 응답 처리, 인증 기반 핀 조회, 컴포넌트 분리 구조

---

# Part 3. Mobile (Dart/Flutter) — 수정 완료

> H-1~H-4, M-7, M-8 이슈는 커밋 `547ca1f`에서 수정 완료

### 잔여 MEDIUM 이슈
- M-9. About 탭 인증 redirect 불일치
- M-10. 마이페이지 페이지네이션 미지원
- M-11. 전역 변수 Repository 접근

### 잘된 점 (5건)
context.mounted 체크 일관성, AutomaticKeepAliveClientMixin, 에러 처리 통일, const 생성자 활용, About 위젯 분리

---

## 우선순위 수정 로드맵

| 순위 | 이슈 | 영향도 | 난이도 |
|:----:|------|--------|--------|
| 1 | S-C1. XFF IP 스푸핑 Rate Limit 우회 | 보안 Critical | 낮음 |
| 2 | S-C2. Rate Limit OOM | 운영 Critical | 중간 |
| 3 | S-C3. Header Injection | 보안 Critical | 낮음 |
| 4 | S-C4. 입력값 파싱 미검증 | 보안 Critical | 낮음 |
| 5 | S-C5. BaseEntity JPA 콜백 | 안정성 Critical | 낮음 |
| 6 | S-H3. 페이지 크기 상한 | 운영 High | 낮음 |
| 7 | S-H4/H10. N+1 쿼리 | 성능 High | 중간 |
| 8 | S-H9. equals/hashCode | 설계 High | 중간 |
| 9 | S-H1. JWT Secret 하드코딩 | 보안 High | 낮음 |
| 10 | S-H2. H2 Console @Profile | 보안 High | 낮음 |
