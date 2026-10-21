iPhone Voice Typing Fix:
1. সব ফাইল project folder-এ replace করুন।
2. npx wrangler deploy --config wrangler.jsonc
3. git add index.html worker.js assets wrangler.jsonc
4. git commit -m "Fix iPhone AI voice typing"
5. git push origin main
6. iPhone Safari-এ mic permission Allow দিন। Chat-এ mic → বাংলা/日本語 → বলুন → লাল ■ টিপুন।
Note: microphone permission and Gemini API audio support required. No audio is saved by this Worker.
