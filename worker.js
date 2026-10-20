// Japanese AI Teacher — Cloudflare Worker
// Secret: GEMINI_API_KEY; optional variable/secret: GEMINI_MODEL
// Never put the Gemini API key in HTML or GitHub.

const ORIGINS = new Set([
  'https://ridoyjp.github.io',
  'https://japansese-ai-teacher.vercel.app'
]);
const DEFAULT_MODEL = 'gemini-3.5-flash-lite'; // Existing model setting takes priority.
const MAX_MESSAGE = 1200;

const TEACHER_PROMPT = `You are Japanese AI Teacher, an accurate and warm tutor teaching Japanese to a Bengali-speaking beginner using Minna no Nihongo.
Your DEFAULT explanation language is EASY BENGALI, regardless of whether the learner sends Japanese, Bengali, English, or Romaji. Japanese input is learning material, not a request to change answer language.
For a Japanese sentence or word, respond to the exact question; do not give a generic welcome message. Explain:
1. The original Japanese text.
2. Its natural Bengali meaning.
3. Key vocabulary and each relevant particle or grammar pattern, including WHY it is used, in easy Bengali.
4. Two or three short, distinct Japanese examples with Bengali meanings.
5. Any needed correction, kindly and in Bengali.
Use Japanese script for Japanese examples. Do not add Romaji unless explicitly requested. For a simple greeting, answer briefly and naturally rather than forcing a long lesson. If explicitly requested to answer only in Japanese, do so in easy Japanese.
Do not mention TTC, school festivals, advertising or unrelated information. Avoid unnecessary English and make pronunciation/grammar explanations precise.`;

function responseHeaders(origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Vary': 'Origin'
  };
  if (ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders(origin)
  });
}

function historyItem(item) {
  if (!item || (item.role !== 'user' && item.role !== 'model')) return null;
  const text = typeof item.text === 'string' ? item.text.trim().slice(0, MAX_MESSAGE) : '';
  return text ? { role: item.role, parts: [{ text }] } : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (url.pathname === '/' && request.method === 'GET') {
      return json({ status: 'Japanese AI Teacher is running', endpoint: '/chat' }, 200, origin);
    }
    if (url.pathname !== '/chat') return json({ error: 'Not found' }, 404, origin);

    // Browser requests from both authorized websites can pass the CORS preflight.
    if (!ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: responseHeaders(origin) });
    }
    if (request.method !== 'POST') return json({ error: 'POST required' }, 405, origin);
    if (!env.GEMINI_API_KEY) {
      return json({ error: 'GEMINI_API_KEY secret missing in this Worker' }, 503, origin);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: 'Invalid JSON request' }, 400, origin);
    }
    const message = String(data?.message ?? data?.question ?? '').trim();
    if (!message || message.length > MAX_MESSAGE) {
      return json({ error: 'Question length must be 1-1200 characters' }, 400, origin);
    }

    const model = String(env.GEMINI_MODEL || DEFAULT_MODEL).trim();
    const japaneseOnly = /(?:Japanese only|日本語だけ|শুধু জাপানি ভাষায় উত্তর)/i.test(message);
    const languageRule = japaneseOnly
      ? 'The learner explicitly requested Japanese only. Reply in simple Japanese.'
      : 'MANDATORY: Explain in easy Bengali even when the input is only Japanese or responseLanguage is ja-JP. Give Japanese text, Bengali meaning, grammar reasons, and 2-3 Japanese examples with Bengali meanings. Do not use Romaji unless requested.';

    const history = (Array.isArray(data?.history) ? data.history : [])
      .slice(-8).map(historyItem).filter(Boolean);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 28000);
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
            systemInstruction: {
              parts: [{ text: TEACHER_PROMPT + '\n' + languageRule }]
            },
            contents: [...history, { role: 'user', parts: [{ text: message }] }],
            generationConfig: { temperature: 0.45, maxOutputTokens: 1600 }
          }),
          signal: controller.signal
        }
      );
      const body = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        // Never log the API key or the user's question.
        const providerCode = String(body?.error?.status || 'UNKNOWN');
        const providerMessage = String(body?.error?.message || '').slice(0, 180);
        console.error('Gemini request failed', {
          httpStatus: upstream.status, providerCode, model, providerMessage
        });
        const errors = {
          400: 'Gemini rejected the request. Check the model and request format.',
          401: 'Gemini authentication failed. Check GEMINI_API_KEY.',
          403: 'Gemini API permission/key issue. Check API access restrictions.',
          404: `Gemini model not found or inaccessible: ${model}. Check GEMINI_MODEL.`,
          429: 'Gemini quota or rate limit reached. Try later.',
          500: 'Gemini service temporarily unavailable.',
          503: 'Gemini service temporarily unavailable.'
        };
        return json({
          error: errors[upstream.status] || 'Gemini API request failed.',
          providerStatus: upstream.status, providerCode
        }, upstream.status === 429 ? 429 : 502, origin);
      }

      const reply = (body?.candidates?.[0]?.content?.parts || [])
        .map(part => typeof part.text === 'string' ? part.text : '')
        .join('').trim();
      if (!reply) return json({ error: 'Gemini returned no text. Try a shorter question.' }, 502, origin);
      return json({ reply: reply.slice(0, 7000) }, 200, origin);
    } catch (error) {
      console.error('Gemini network/timeout error', { name: error?.name });
      return json({
        error: error?.name === 'AbortError'
          ? 'Gemini timed out. Try again.'
          : 'Could not contact Gemini.'
      }, 504, origin);
    } finally {
      clearTimeout(timer);
    }
  }
};
