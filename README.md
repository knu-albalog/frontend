# 📱 AlbaLog (알바로그)

알바 근무를 기록하고 관리하는 React Native 앱입니다.

---

## 🚀 실행 방법

### 1️⃣ 필수 설치

아래 프로그램이 설치되어 있어야 합니다.

- Node.js (LTS 버전 권장)
- npm (Node 설치 시 같이 설치됨)
- Expo Go 앱 (핸드폰)

설치 확인:
```bash
node -v
npm -v
```

---

### 2️⃣ 프로젝트 실행

```bash
npm install
npm start
```

---

### 3️⃣ 앱 실행 방법

1. 터미널에 QR코드가 표시됨
2. 핸드폰에서 **Expo Go 앱 실행**
3. QR코드 스캔

---

### ⚠️ 중요

- PC와 핸드폰은 **같은 와이파이**에 연결되어 있어야 합니다.

---

## 📁 폴더 구조

```
app/         → 화면 (페이지)
components/  → 재사용 컴포넌트
constants/   → 색상, 설정값
hooks/       → 커스텀 훅
scripts/     → 실행 스크립트
```

---

## 📌 폴더 사용 규칙

### 🔹 app/
- 화면(UI 페이지) 작성
- 파일 이름 = 라우팅 경로

예:
```
app/index.tsx      → 홈 화면
app/login.tsx      → 로그인 화면
```

---

### 🔹 components/
- 재사용 가능한 UI 컴포넌트

예:
```
Button.tsx
Card.tsx
```

- 화면 로직 ❌ (UI 중심으로 작성)

---

### 🔹 constants/
- 색상, 테마, 설정값

---

### 🔹 hooks/
- 커스텀 훅

---

### 🔹 scripts/
- 실행 스크립트

---

## 🔥 Git 협업 규칙

### 브랜치 구조

```
main      → 최종 배포
dev       → 개발 통합
feature/* → 기능 개발
```

---

## 🔄 브랜치 작업 방법

### 1️⃣ 최신 코드 가져오기
```bash
git checkout dev
git pull origin dev
```

---

### 2️⃣ 기능 브랜치 생성
```bash
git checkout -b feature/login
```

---

### 3️⃣ 작업 후 커밋
```bash
git add .
git commit -m "feat: 로그인 기능 구현"
```

---

### 4️⃣ 원격 저장소에 push
```bash
git push origin feature/login
```

---

### 5️⃣ GitHub에서 PR 생성
- feature → dev로 Pull Request 생성

---

### 6️⃣ 브랜치 이동
```bash
git checkout dev
git checkout main
```

---

### 7️⃣ 브랜치 목록 확인
```bash
git branch
```

---

## ❗ 협업 규칙

- main 직접 push ❌
- dev 직접 push ❌ (PR 사용 권장)
- 기능 단위로 브랜치 생성
- 작업 전 항상 `git pull`

---

## 💡 개발 팁

- 코드 수정 시 자동 반영됨
- 새로고침: `r`
- 캐시 초기화:
```bash
npm start -- --reset-cache
```

---

## 📌 참고

- Expo 기반 프로젝트
- Android / iOS / Web 지원

---

## 👍 한 줄 정리

👉 화면은 app, 재사용은 components, 협업은 PR
