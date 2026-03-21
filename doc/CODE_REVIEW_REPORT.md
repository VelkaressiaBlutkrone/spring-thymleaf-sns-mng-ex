# Code Review Report

**프로젝트:** spring-react-flutter-sns-mng
**리뷰 일자:** 2026-03-21
**리뷰 대상:** main 브랜치 미커밋 변경사항 (web 26개 파일, mobile 9개 파일)
**변경 성격:** 디자인 시스템 마이그레이션 (stone/emerald -> slate/brand) + 모바일 마이페이지/About 기능 추가

---

## 📊 리뷰 요약

| 등급 | 건수 | 머지 가능 여부 |
|------|------|--------------|
| 🔴 Critical | 0건 | - |
| 🟡 Major (HIGH) | 4건 | ⚠️ 수정 권고 |
| 🟡 Major (MEDIUM) | 11건 | ⚠️ 수정 권고 |
| 🟢 Minor (LOW) | 8건 | ✅ 선택적 수정 |
| 💬 Nitpick | 5건 | ✅ 논의 가능 |
| ✅ 잘된 점 | 11건 | - |

**결론: Critical 없음 — HIGH 4건 수정 후 머지 가능**

---

## 🟡 HIGH (즉시 수정 권고)

### H-1. 카테고리 색상 불일치 — PinOverlay.tsx vs constants.ts

**위치:** `web/src/components/map/PinOverlay.tsx:26-33`
**문제:** `constants.ts`에서 카테고리 색상이 변경되었으나(food: rose, photo: violet, must-visit: cyan), `PinOverlay.tsx`의 `CATEGORY_COLORS`는 이전 값(food: orange, photo: blue, must-visit: yellow)을 유지하고 있어 UI 불일치 발생

**Before:**
```typescript
// PinOverlay.tsx (구 색상 유지 — 불일치)
const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-orange-500',       // constants.ts에서는 bg-rose-500
  photo: 'bg-blue-500',        // constants.ts에서는 bg-violet-500
  'must-visit': 'bg-yellow-500', // constants.ts에서는 bg-cyan-500
};
```

**After:**
```typescript
// constants.ts에서 import하여 단일 소스로 통합
import { CATEGORIES } from '../../constants';
const CATEGORY_COLORS = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c.color])
);
```

---

### H-2. 카테고리 색상 불일치 — App.tsx getPinMarkerImage

**위치:** `web/src/App.tsx:72-79`
**문제:** SVG 마커의 hex 색상이 `constants.ts`의 새 팔레트와 불일치. food: `#f97316`(orange) vs `#f43f5e`(rose), photo: `#3b82f6`(blue) vs `#8b5cf6`(violet). 또한 기본값 주석이 `slate-500`이라고 했지만 실제 값 `#78716c`은 `stone-500`

**Before:**
```typescript
const color =
  category === 'food' ? '#f97316' :     // orange-500 (불일치)
  category === 'photo' ? '#3b82f6' :    // blue-500 (불일치)
  category === 'must-visit' ? '#eab308' : // yellow-500 (불일치)
  '#78716c'; // 주석: slate-500, 실제: stone-500
```

**After:**
```typescript
const CATEGORY_HEX: Record<string, string> = {
  cafe: '#f59e0b',        // amber-500
  food: '#f43f5e',        // rose-500
  photo: '#8b5cf6',       // violet-500
  favorite: '#ec4899',    // pink-500
  'must-visit': '#06b6d4', // cyan-500
};
const color = CATEGORY_HEX[category] || '#64748b'; // slate-500
```

---

### H-3. PinRepository 중복 메서드 — getMine() vs getMyPins()

**위치:** `mobile/lib/data/repository/pin_repository.dart:15-54`
**문제:** `getMine()` (GET `/api/pins`)과 `getMyPins()` (GET `/api/me/pins`)이 동일 목적("내 Pin 목록")으로 존재. 서로 다른 API 엔드포인트를 호출하여 혼동 유발

**Before:**
```dart
Future<PageResponse<PinResponse>> getMine({ ... })    // GET /api/pins
Future<PageResponse<PinResponse>> getMyPins({ ... })  // GET /api/me/pins
```

**After:**
```dart
/// 전체 Pin 목록: GET /api/pins
Future<PageResponse<PinResponse>> getAll({ ... })

/// 마이페이지용 내 Pin 목록: GET /api/me/pins
Future<PageResponse<PinResponse>> getMine({ ... })
```

---

### H-4. 이미지 게시글 삭제 후 잘못된 경로로 이동

**위치:** `mobile/lib/presentation/screens/image_posts/image_post_detail_screen.dart:60`
**문제:** 이미지 게시글 삭제 후 일반 게시글 목록(`AppRoutes.posts`)으로 이동 — 사용자 경험상 논리 오류

**Before:**
```dart
context.go(AppRoutes.posts); // 일반 게시글 목록으로 이동
```

**After:**
```dart
context.go(AppRoutes.imagePosts); // 이미지 게시글 목록으로 이동
// 또는
context.pop(); // 이전 화면으로 복귀
```

---

## 🟡 MEDIUM (수정 권고)

### M-1. Tailwind 클래스 오류 — `border-bottom`

**위치:** `web/src/pages/ProfilePage.tsx:138`
**문제:** `border-bottom`은 유효한 Tailwind 클래스가 아님. `border-b`가 올바른 형식. 하단 테두리가 렌더링되지 않는 버그

```diff
- <header className="... border-bottom border-slate-200 ...">
+ <header className="... border-b border-slate-200 ...">
```

---

### M-2. 카테고리 정의 3곳 분산 — DRY 위반

**위치:** `web/src/constants.ts`, `web/src/components/map/PinOverlay.tsx:17-33`, `web/src/App.tsx:72-79`
**문제:** 카테고리 메타데이터(아이콘, 색상, hex)가 3곳에 분산 정의. 이번 색상 변경에서 2곳이 누락됨

**개선:** `constants.ts`에 `hex` 필드를 추가하고 모든 곳에서 import

---

### M-3. useMapSNS.ts God Hook — 780줄 SRP 위반

**위치:** `web/src/hooks/useMapSNS.ts`
**문제:** auth, posts CRUD, pins CRUD, search, routing, notifications, likes, profile, geolocation 등 모든 책임이 단일 훅에 집중

**개선:** `useAuth`, `usePosts`, `usePins`, `useSearch`, `useRoute` 등 도메인별 훅으로 분리

---

### M-4. App.tsx MapView 1043줄 — God Component

**위치:** `web/src/App.tsx`
**문제:** 단일 컴포넌트가 1000줄 이상. 헤더, 하단 네비, 레이어 컨트롤, 생성 모드 UI 등 추출 필요

---

### M-5. `any` 타입 25개 이상 남용

**위치:** `web/src/hooks/useMapSNS.ts:280,309,331,488`, `web/src/components/layout/NavItem.tsx:6`, `web/src/components/map/RouteOverlay.tsx:25,28`
**문제:** 타입 안전성 제거. 런타임 에러 가능성

**개선:** `SearchResult`, `KakaoPlace`, `RouteOption` 등 인터페이스 정의. 아이콘 prop은 `React.ComponentType<{ className?: string }>` 사용

---

### M-6. useEffect 의존성 배열 불완전

**위치:** `web/src/App.tsx:111-142`
**문제:** deep linking useEffect에서 `smoothMove` 함수가 매 렌더마다 재생성되나 의존성에 미포함. `m.set*` 함수의 참조 안정성도 불확실

**개선:** `smoothMove`를 `useCallback`으로 래핑, setter 참조 안정성 보장

---

### M-7. TextEditingController dispose 누락 경로

**위치:** `mobile/lib/presentation/screens/me/me_screen.dart:92`
**문제:** `_showEditProfileDialog`에서 early return 시 `controller.dispose()` 미호출 — 메모리 누수

**Before:**
```dart
if (saved != true || !mounted) return; // dispose 없이 반환
// ...
controller.dispose(); // 여기까지 도달 못할 수 있음
```

**After:**
```dart
final controller = TextEditingController(text: authState.member.nickname);
try {
  final saved = await showDialog<bool>( ... );
  if (saved != true || !mounted) return;
  // ...
} finally {
  controller.dispose();
}
```

---

### M-8. 삭제 후 상세 Provider invalidate 누락

**위치:** `mobile/lib/presentation/screens/posts/post_detail_screen.dart:52-53`, `mobile/lib/presentation/screens/image_posts/image_post_detail_screen.dart:54-55`
**문제:** 삭제 후 목록 Provider만 invalidate하고 상세 Provider는 남겨둬 캐시된 데이터 잔존 가능

```diff
  ref.invalidate(postListProvider(const PostListParams()));
+ ref.invalidate(postDetailProvider(postId));
```

---

### M-9. About 탭 인증 redirect 불일치

**위치:** `mobile/lib/core/router/app_router.dart:62-65`
**문제:** `/me`는 인증 필수이나 같은 StatefulShellRoute 내 `/about`은 비인증 접근 가능. 비로그인 사용자가 About에서 마이페이지 탭으로 이동 시 로딩 스피너 무한 표시

---

### M-10. 마이페이지 탭 페이지네이션 미지원

**위치:** `mobile/lib/presentation/screens/me/me_screen.dart:212`
**문제:** 3개 탭 모두 `page: 0, size: 20` 고정 호출. 20개 초과 데이터 미표시

---

### M-11. 전역 변수 통한 Repository 직접 접근

**위치:** `mobile/lib/presentation/screens/me/me_screen.dart:212,280,360`
**문제:** Riverpod 사용 프로젝트에서 전역 late 변수로 Repository 접근. 테스트 용이성 저하 (단, 프로젝트 기존 컨벤션과는 일치)

---

## 🟢 Minor (선택적 수정)

### L-1. `alert()` 사용 — 차단적 UX

**위치:** `web/src/hooks/useMapSNS.ts:176,180,211,236,252,271`
**문제:** 기존 toast 시스템이 있는데 `alert()` 사용. 메인 스레드 차단, 스타일링 불가

---

### L-2. `console.error`/`console.warn` 프로덕션 잔존

**위치:** `web/src/hooks/useMapSNS.ts` (9건), `web/src/pages/ProfilePage.tsx` (2건), `web/src/App.tsx` (1건)
**개선:** logger 유틸리티 도입 또는 빌드 타임 strip 설정

---

### L-3. Route 선 색상 하드코딩

**위치:** `web/src/App.tsx:310`
**문제:** `#338dff` 하드코딩. `--color-brand-500` CSS 변수와 동일하므로 상수 추출 권장

---

### L-4. `gradient` 필드 미사용 (죽은 코드)

**위치:** `web/src/constants.ts:4-9`
**문제:** `CATEGORIES`에 `gradient` 속성 추가했으나 어디에서도 미참조

---

### L-5. `m.user.name[0]` 빈 문자열 위험

**위치:** `web/src/App.tsx:69` 외 다수
**문제:** `name`이 빈 문자열이면 `undefined` 반환. `name?.[0] || '?'` 안전 접근 권장

---

### L-6. 삭제 확인 다이얼로그 코드 중복

**위치:** `mobile/lib/presentation/screens/posts/post_detail_screen.dart:27-67`, `mobile/lib/presentation/screens/image_posts/image_post_detail_screen.dart:29-69`
**문제:** 거의 동일한 삭제 확인 + API 호출 + SnackBar 패턴 중복

---

### L-7. `_isAuthor` 메서드 중복

**위치:** 위 두 파일에서 완전 동일한 메서드. 공용 유틸리티 추출 권장

---

### L-8. 매직 넘버 — 탭 개수

**위치:** `mobile/lib/presentation/screens/me/me_screen.dart:31`
**문제:** `TabController(length: 3)` — `static const _tabCount = 3` 권장

---

## 💬 Nitpick

### N-1. 주석 hex 값 오류
`web/src/App.tsx:79` — `#78716c`은 `stone-500`이지 `slate-500`이 아님

### N-2. `font-[Sora]` 임의값 사용
`web/src/components/modals/AuthModal.tsx` — `index.css`에 `--font-display: "Sora"` 정의 있으므로 `font-display` 클래스 사용 권장

### N-3. 미사용 CSS 유틸리티
`web/src/index.css` — `glass`, `glass-dark`, `card-lift`, `gradient-warm`, `gradient-cool`, `gradient-glow` 정의 후 미사용

### N-4. 날짜 파싱 — `split('T').first`
`mobile/lib/presentation/screens/me/me_screen.dart:158` — `DateTime.parse` + `DateFormat` 사용이 안전

### N-5. RefreshIndicator onRefresh 즉시 완료
`mobile/lib/presentation/screens/me/me_screen.dart:241` — `_reload()`가 `Future`를 반환하지 않아 스피너가 즉시 사라짐

---

## ✅ 잘된 점

### Web (React/TypeScript)
1. **일관된 디자인 토큰 마이그레이션** — stone->slate, emerald->brand 전환이 26개 파일에 걸쳐 체계적으로 적용됨
2. **CSS 변수 기반 브랜드 팔레트** — `--color-brand-*` 커스텀 속성으로 유지보수성 확보
3. **접근성 개선** — `prefers-reduced-motion` 미디어 쿼리로 애니메이션 비활성화 지원
4. **방어적 API 응답 처리** — `Array.isArray(postsData) ? postsData : postsData.content ?? []`로 배열/Page 응답 양쪽 대응
5. **인증 기반 핀 조회** — 로그인 시만 `/pins` fetch, 로그아웃 시 클리어하는 올바른 동작
6. **컴포넌트 분리 구조** — Overlay, Modal, Layout, Feed 등 관심사별 파일 분리 양호

### Mobile (Dart/Flutter)
7. **context.mounted 체크 일관성** — 비동기 작업 후 disposed widget 접근 방지 철저
8. **AutomaticKeepAliveClientMixin** — 탭 전환 시 상태 유지 적절 활용
9. **에러 처리 패턴 통일** — `DioException` -> `AppException` 매핑 + UI 계층 catch 일관
10. **const 생성자 적극 활용** — `const Text()`, `const SizedBox()` 등 불변 위젯에 잘 적용
11. **About 화면 위젯 분리** — `_SectionTitle`, `_FeatureItem`, `_TechStackCard` 깔끔한 추출

---

## 💬 PR 코멘트 (복사용)

```
## 📊 코드 리뷰 요약
- 🔴 Critical: 0건
- 🟡 HIGH: 4건 (카테고리 색상 불일치 2건, PinRepo 중복, 삭제 후 잘못된 네비게이션)
- 🟡 MEDIUM: 11건
- 🟢 Minor: 8건

## 🟡 우선 수정 필요 (HIGH)

🟡 **[Major] 카테고리 색상 불일치 — PinOverlay.tsx, App.tsx**
`constants.ts`에서 카테고리 색상을 rose/violet/cyan으로 변경했으나,
`PinOverlay.tsx`의 `CATEGORY_COLORS`와 `App.tsx`의 `getPinMarkerImage`는
이전 orange/blue/yellow 값을 유지하고 있어 핀 마커 색상이 나머지 UI와 불일치합니다.
`constants.ts`를 단일 소스로 통합하면 향후 이런 드리프트를 방지할 수 있습니다.

🟡 **[Major] 이미지 게시글 삭제 → 일반 게시글 목록으로 이동**
`image_post_detail_screen.dart:60`에서 삭제 후 `AppRoutes.posts`(일반 게시글)로
이동합니다. `AppRoutes.imagePosts`로 수정하거나 `context.pop()`이 적절합니다.

🟡 **[Major] PinRepository — getMine() / getMyPins() 중복**
동일 목적의 메서드가 서로 다른 엔드포인트를 호출합니다.
어느 것이 정확한 "내 Pin" API인지 명확히 하고 하나로 통합해주세요.

## ✅ 잘된 점
- 디자인 시스템 마이그레이션이 26개 파일에 걸쳐 일관되게 적용됨
- prefers-reduced-motion 접근성 지원 추가
- Flutter에서 context.mounted 체크가 비동기 작업 후 빠짐없이 적용됨
- const 생성자와 AutomaticKeepAliveClientMixin 적절 활용

---
*Critical 0건 — HIGH 4건 수정 후 머지 가능합니다.*
```
