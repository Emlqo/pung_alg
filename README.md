# pung_alg

`pung_alg`는 알고리즘 순서도 빈칸 채우기를 연습할 수 있는 학습용 웹사이트입니다. 교사는 순서도 문제를 만들고 Firestore에 저장할 수 있으며, 학생은 저장된 스테이지를 선택해 선택지를 드래그앤드랍으로 빈칸에 넣고 정답을 확인할 수 있습니다.

## 주요 기능

- 학생용 스테이지 목록 및 문제 풀이 화면
- 순서도 노드, 연결선, 조건 분기 라벨 표시
- 선택지 드래그앤드랍 및 빈칸 채우기
- 정답 확인, 오답 빈칸 표시, 다시 풀기
- 교사용 문제 목록, 미리보기, 삭제
- 교사용 자유 편집 방식 순서도 제작기
- Firebase Firestore 기반 스테이지 저장 및 조회

## 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- Firebase Firestore
- dnd-kit
- ESLint

## 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

배포 전 점검은 아래 명령어로 실행합니다.

```bash
npm run lint
npm run build
```

## Firebase 설정 방법

Firebase Console에서 웹 앱을 만들고 Firestore Database를 생성합니다. 프로젝트 루트에 `.env.local` 파일을 만들고 Firebase 웹 앱 설정값을 넣습니다.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

현재 프로젝트는 로그인 없이 사용할 수 있도록 설계되어 있습니다. `Stage` 타입에는 추후 로그인 기능을 붙일 수 있도록 선택 필드 `teacherId`가 있지만, 지금은 `teacherId`가 없어도 저장과 조회가 가능합니다.

개발 테스트용 Firestore rules 예시는 `firestore.rules.example`에 있습니다. 실제 배포 환경에서는 반드시 Firebase Authentication을 연결하고 인증 기반 security rules로 변경해야 합니다.

## Vercel 배포 방법

1. GitHub 저장소에 프로젝트를 push합니다.
2. Vercel에서 새 프로젝트를 만들고 해당 저장소를 연결합니다.
3. Framework Preset은 `Next.js`를 선택합니다.
4. Vercel 프로젝트의 `Settings > Environment Variables`에 `.env.local`과 같은 Firebase 환경변수를 등록합니다.
5. 배포 전에 로컬에서 `npm run lint`와 `npm run build`가 성공하는지 확인합니다.
6. Vercel에서 Deploy를 실행합니다.

Vercel에는 `.env.local` 파일을 직접 올리지 않고, Environment Variables 메뉴에 값을 등록합니다.
