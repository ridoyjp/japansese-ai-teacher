Japanese Ai Ebook — General AI + Greeting Update

1. index.html এবং assets ফোল্ডার GitHub repo-তে রাখুন।
2. worker.js এবং wrangler.jsonc একই root folder-এ রাখুন। আগে থাকা wrangler.jsonc কনফিগে দরকারি অন্য setting থাকলে সেগুলো সংরক্ষণ করুন; নতুন main: worker.js এবং name: japanese-ai-teacher নিশ্চিত করুন।
3. Secret GEMINI_API_KEY এবং valid GEMINI_MODEL আগে থেকে Cloudflare Worker-এ থাকতে হবে। কোনো Key HTML/GitHub-এ রাখবেন না।
4. CMD:
 cd /d "C:\Git\Japanese Ai Teacher"
 npx wrangler deploy --config wrangler.jsonc
 git add index.html assets worker.js wrangler.jsonc
 git commit -m "Add general AI answers and Assalamu Alaikum greeting"
 git push origin main

ওয়েবসাইট ও Cloudflare Worker দুটোই আপডেট করতে হবে। AI উত্তরের জন্য internet ও API quota দরকার।
