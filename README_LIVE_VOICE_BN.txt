Japanese AI Ebook — Live Voice Mode

Chat-এর ◉ Live বাটন চাপুন। বাংলা বা Japanese বলুন, ২ সেকেন্ড থামুন। পুরোনো /transcribe Worker কথাকে text করবে, /chat উত্তর দেবে, ফোনের Text-to-Speech উত্তর বলবে। এরপর আবার শোনা শুরু হবে। বন্ধ করতে ✕ চাপুন।

এটি turn-based voice chat; ChatGPT-এর সমান real-time streaming API নয়। iPhone-এ বাংলা TTS voice না থাকলে বাংলা উচ্চারণ বা playback কাজ নাও করতে পারে। Device microphone permission এবং Worker /transcribe deployment আবশ্যক।

Deploy: পুরোনো worker.js ও wrangler.jsonc অপরিবর্তিত। প্রথমে /transcribe worker deploy না থাকলে npx wrangler deploy --config wrangler.jsonc তারপর git add index.html && git commit -m "Add live voice conversation" && git push origin main
