// api/generate.js  →  POST /api/generate
import { createHash, timingSafeEqual } from 'node:crypto';
import {
  AppError, MOODS, MAX_SENTENCE_LENGTH, PROVIDERS, isProviderConfigured
} from './_lib/providers.js';

/* 접속 코드 비교 (길이와 상관없이 같은 시간에 비교) */
function sameCode(input, expected) {
  const a = createHash('sha256').update(String(input)).digest();
  const b = createHash('sha256').update(String(expected)).digest();
  return timingSafeEqual(a, b);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { /* 아래에서 처리 */ }
  }
  throw new AppError(400, 'INVALID_INPUT', '요청 형식이 올바르지 않습니다.', '페이지를 새로고침한 뒤 다시 시도하세요.');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method !== 'POST') {
      throw new AppError(405, 'METHOD_NOT_ALLOWED', 'POST 요청만 받을 수 있습니다.', '웹페이지의 만들기 버튼으로 요청하세요.');
    }

    const body = readBody(req);

    /* 1) 실습 접속 코드 확인 */
    const expectedCode = process.env.ACCESS_CODE;
    if (!expectedCode) {
      throw new AppError(500, 'ACCESS_CODE_NOT_CONFIGURED',
        '서버에 실습 접속 코드가 아직 설정되지 않았습니다.',
        '관리자가 Vercel 환경 변수에 ACCESS_CODE를 추가하고 다시 배포해야 합니다. 그동안 예제 모드를 쓰세요.');
    }
    const accessCode = typeof body.accessCode === 'string' ? body.accessCode.trim() : '';
    if (!accessCode) {
      throw new AppError(401, 'ACCESS_CODE_REQUIRED', '실습 접속 코드를 입력하세요.', '수업에서 안내받은 코드를 접속 코드 칸에 입력한 뒤 다시 만드세요.');
    }
    if (!sameCode(accessCode, expectedCode)) {
      throw new AppError(401, 'ACCESS_CODE_INVALID', '실습 접속 코드가 맞지 않습니다.', '대소문자와 띄어쓰기를 확인해 다시 입력하세요.');
    }

    /* 2) 입력값 확인 */
    const sentence = typeof body.sentence === 'string' ? body.sentence.trim() : '';
    if (sentence.length < 1 || sentence.length > MAX_SENTENCE_LENGTH) {
      throw new AppError(400, 'INVALID_INPUT',
        `문장은 1~${MAX_SENTENCE_LENGTH}자로 입력하세요.`, `지금은 ${sentence.length}자입니다. 길이를 맞춘 뒤 다시 만드세요.`);
    }
    if (!MOODS[body.mood]) {
      throw new AppError(400, 'INVALID_INPUT', '분위기 값이 올바르지 않습니다.', '분위기를 다시 선택한 뒤 만드세요.');
    }
    const providerId = body.provider;
    if (!PROVIDERS[providerId]) {
      throw new AppError(400, 'INVALID_INPUT', 'AI 서비스 값이 올바르지 않습니다.', 'Claude나 OpenAI 중 하나를 선택하세요.');
    }
    if (!isProviderConfigured(providerId)) {
      throw new AppError(503, 'PROVIDER_NOT_CONFIGURED',
        `${PROVIDERS[providerId].label} API 키가 서버에 설정되어 있지 않습니다.`,
        '다른 AI 서비스를 선택하세요. 이 서비스를 쓰려면 관리자가 Vercel 환경 변수에 키를 추가하고 다시 배포해야 합니다.');
    }

    /* 3) AI 호출 */
    const result = await PROVIDERS[providerId].call(sentence, body.mood);
    return res.status(200).json({ ...result, provider: providerId });
  } catch (err) {
    const error = err instanceof AppError
      ? err
      : new AppError(500, 'SERVER_ERROR', '서버에서 예상하지 못한 오류가 발생했습니다.', '잠시 후 다시 시도하세요.');
    if (!(err instanceof AppError)) console.error('[generate]', err);
    return res.status(error.status).json({
      error: { code: error.code, message: error.message, hint: error.hint }
    });
  }
}
