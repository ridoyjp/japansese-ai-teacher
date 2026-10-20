// Japanese AI Teacher — Cloudflare Worker
// Cloudflare > Workers & Pages > japanese-ai-teacher > Edit code
// Secret: GEMINI_API_KEY | Optional text variable: GEMINI_MODEL
// Keep keys OUT of HTML / GitHub.

const ORIGINS = new Set(['https://ridoyjp.github.io']);
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_MESSAGE = 1200;

const TEACHER_PROMPT = `You are Japanese AI Teacher, a warm, accurate tutor teaching beginner Japanese to a Bengali-speaking student studying Minna no Nihongo.
ALWAYS explain the lesson in very easy BENGALI, regardless of whether the student's message is written or spoken in Japanese, Bengali, English or Romaji. Japanese input is material to teach, NOT a request to switch the teaching language. Never answer only in Japanese unless the student explicitly requests 'Japanese only'/'日本語だけで答えて' (not merely typing Japanese).
For ANY Japanese word or Japanese sentence:
1. Show the original Japanese in Japanese script.
2. Give its natural Bengali meaning.
3. Explain each important word, particle, and grammar form in easy Bengali, including WHY it appears and when to use it.
4. Provide 2 or 3 short DIFFERENT Japanese examples, each followed by Bengali meaning.
5. Correct errors gently when appropriate and explain corrections in Bengali.
Do not include Romaji unless the student explicitly asks for Romaji. Be concise for simple greetings and follow the user's exact question. Do not mention TTC, school festivals, ads or unrelated subjects. Avoid English explanations and unnecessary markdown syntax. Be precise about Japanese grammar.`;

function headers(origin) {
  const h = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    Vary: 'Origin'
  };
  if (ORIGINS.has(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}
function respond(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: headers(origin) });
}
function toText(entry) {
  if (!entry || !['user', 'model'].includes(entry.role)) return null;
  const value = typeof entry.text === 'string' ? entry.text.trim().slice(0, 1200) : '';
  return value ? { role: entry.role, parts: [{ text: value }] } : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // Health check, intentionally public. Does not validate the Gemini key.
    if (url.pathname === '/' && request.method === 'GET') {
      return respond({ status: 'Japanese AI Teacher is running', endpoint: '/chat' }, 200, origin);
    }
    if (url.pathname !== '/chat') return respond({ error: 'Not found' }, 404, origin);
    if (!ORIGINS.has(origin)) return respond({ error: 'Origin not allowed' }, 403, origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(origin) });
    if (request.method !== 'POST') return respond({ error: 'POST required' }, 405, origin);
    if (!env.GEMINI_API_KEY) return respond({ error: 'GEMINI_API_KEY secret missing in this Worker' }, 503, origin);

    let data;
    try { data = await request.json(); }
    catch { return respond({ error: 'Invalid JSON request' }, 400, origin); }
    const message = String(data?.message ?? data?.question ?? '').trim();
    if (!message || message.length > MAX_MESSAGE) {
      return respond({ error: 'Question length must be 1-1200 characters' }, 400, origin);
    }

    const model = String(env.GEMINI_MODEL || DEFAULT_MODEL).trim();
    const japaneseOnly = /(?:Japanese only|日本語だけ|শুধু জাপানি ভাষায় উত্তর)/i.test(message);
    const languageRule = japaneseOnly
      ? 'The user explicitly requested a Japanese-only reply; respond in simple Japanese.'
      : 'MANDATORY: Explain in very easy Bengali even if the input is entirely Japanese or responseLanguage is ja-JP. Include Japanese script, Bengali meaning, why grammar/particles are used, and 2–3 examples with Bengali translations. NO ROMAJI unless requested.';
    const history = (Array.isArray(data.history) ? data.history : [])
      .slice(-8).map(toText).filter(Boolean);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 28000);
    try {
      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: TEACHER_PROMPT + '\n' + languageRule }] },
            contents: [...history, { role: 'user', parts: [{ text: message }] }],
            generationConfig: { temperature: 0.45, maxOutputTokens: 1600 }
          }),
          signal: controller.signal
        }
      );
      const body = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        // Do NOT log secret, request body, or student input.
        const providerCode = String(body?.error?.status || 'UNKNOWN');
        const providerMessage = String(body?.error?.message || '').slice(0, 180);
        console.error('Gemini request failed', { httpStatus: upstream.status, providerCode, model, providerMessage });
        const messages = {
          400: 'Gemini rejected the request. Check the model and request format.',
          401: 'Gemini authentication failed. Check GEMINI_API_KEY.',
          403: 'Gemini API permission/key issue. Check the key and project restrictions.',
          404: `Gemini model not found or inaccessible: ${model}. Check GEMINI_MODEL.`,
          429: 'Gemini API rate limit or quota reached. Try later or check quota.',
          500: 'Gemini service temporarily unavailable.',
          503: 'Gemini service temporarily unavailable.'
        };
        return respond({ error: messages[upstream.status] || 'Gemini API request failed.', providerStatus: upstream.status, providerCode }, upstream.status === 429 ? 429 : 502, origin);
      }
      const reply = (body?.candidates?.[0]?.content?.parts || [])
        .map(p => typeof p.text === 'string' ? p.text : '').join('').trim();
      if (!reply) return respond({ error: 'Gemini returned no text. Retry with a shorter question.' }, 502, origin);
      return respond({ reply: reply.slice(0, 7000) }, 200, origin);
    } catch (e) {
      console.error('Gemini network/timeout error', { name: e?.name });
      return respond({ error: e?.name === 'AbortError' ? 'Gemini timed out. Try again.' : 'Could not contact Gemini.' }, 504, origin);
    } finally { clearTimeout(timeout); }
  }
};
