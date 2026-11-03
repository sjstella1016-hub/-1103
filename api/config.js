// api/config.js  →  GET /api/config
// 어떤 AI 서비스가 준비되었는지만 알려 줍니다. 키 값은 절대 보내지 않습니다.
import { PROVIDERS, isProviderConfigured } from './_lib/providers.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const providers = Object.fromEntries(
    Object.keys(PROVIDERS).map((id) => [id, isProviderConfigured(id)])
  );
  const preferred = process.env.DEFAULT_AI_PROVIDER;
  const defaultProvider = providers[preferred]
    ? preferred
    : Object.keys(providers).find((id) => providers[id]) || null;

  res.status(200).json({
    providers,
    defaultProvider,
    accessCodeConfigured: Boolean(process.env.ACCESS_CODE)
  });
}
