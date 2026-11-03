# 한 문장 전시실

문장 하나와 분위기(고요함, 따뜻함, 밤의 풍경)를 고르면 전시 제목과 짧은 소개 글을 만들어 주는 웹페이지입니다.

- **예제 모드**: AI를 호출하지 않고 준비된 응답을 보여 줍니다. 설정 없이 바로 동작합니다.
- **AI 모드**: 실습 접속 코드를 입력하면 Claude 또는 OpenAI가 문장에 맞춰 새로 씁니다.

API 키는 Vercel 서버의 환경 변수에만 보관되며, 웹페이지 코드나 브라우저에는 전달되지 않습니다.

## 파일 구성

```
index.html              화면 (예제 모드 / AI 모드)
api/generate.js         POST /api/generate  접속 코드 확인 후 AI 호출
api/config.js           GET  /api/config    어떤 AI가 준비됐는지 알려 줌 (키 값은 보내지 않음)
api/_lib/providers.js   Claude·OpenAI 호출과 오류 안내 문구
vercel.json             함수 최대 실행 시간 30초
.env.example            환경 변수 목록 (값은 비어 있음)
```

## 배포하기

1. 이 폴더를 GitHub 저장소에 올립니다. (`.env.local`은 `.gitignore`에 있어 올라가지 않습니다.)
2. vercel.com에서 **Add New → Project**로 저장소를 가져옵니다. Framework Preset은 **Other**, 나머지는 기본값 그대로 둡니다.
3. **Settings → Environment Variables**에 `.env.example`의 항목을 입력합니다.
4. **Deployments**에서 다시 배포(Redeploy)합니다. 환경 변수는 새로 배포해야 반영됩니다.

## 내 컴퓨터에서 확인하기

```bash
npm i -g vercel
cp .env.example .env.local   # 값 채우기
vercel dev                    # http://localhost:3000
```

index.html을 더블클릭해서 열면 예제 모드만 동작합니다.
