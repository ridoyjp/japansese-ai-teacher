🎙️ Live Voice Sound Fix

1. ZIP-এর index.html, worker.js, assets, wrangler.jsonc প্রোজেক্ট ফোল্ডারে Replace করো।
2. Wrangler config-এ আগের Worker name এবং secret settings বজায় রাখো।
3. npx wrangler deploy --config wrangler.jsonc
4. git add index.html worker.js assets wrangler.jsonc
5. git commit -m "Fix live voice AI reply sound with Gemini TTS"
6. git push origin main

Live Chat-এর 🔊 বাটনে প্রথমে ছোট Beep বাজবে। আগের AI উত্তর থাকলে পুনরায় পড়বে।
Cloudflare GEMINI_API_KEY Secret লাগবে; Gemini TTS model доступ/কোটা প্রয়োজন। GEMINI_TTS_MODEL optional (default: gemini-2.5-flash-preview-tts)।
এটি turn-based voice, streaming নয়। Text Chat-এর উত্তর স্বয়ংক্রিয়ভাবে পড়ে না।
