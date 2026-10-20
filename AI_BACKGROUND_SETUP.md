# বাংলা AI Teacher — একবার Background Setup

এখন Website-এ **AI Server URL input box নেই**। প্রতিটি শব্দের পাশের AI বাটন ও Chat ব্যবহারকারীর জন্য সরাসরি কাজ করবে, তবে Backend একবার সেটআপ করতে হবে।

1. https://dash.cloudflare.com/ → Workers & Pages → Create Worker।
2. `worker.js`-এর কোড দিয়ে Worker Deploy করো।
3. Worker Settings → Variables and Secrets-এ secret `OPENAI_API_KEY` যোগ করো। Secret কখনো GitHub বা HTML-এ লিখবে না।
4. Deploy করার পরে Workers-এর নিজের HTTPS URL কপি করো (`https://abc.username.workers.dev`)।
5. `index.html`-এ মাত্র একবার `AI_SERVER_URL` লাইনের `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev` অংশটি নিজের Worker URL দিয়ে বদলাও।
6. HTML GitHub repository-র `index.html` ফাইলের জায়গায় দাও। এরপর আর কোনো Visitor-কে URL লিখতে হবে না।

**নোট:** এখানে তোমার Worker URL বা OpenAI API Key দেওয়া হয়নি, তাই এক্ষুনি LIVE AI কাজ করবে না। GitHub Pages API secret নিরাপদে রাখতে পারে না। OpenAI API paid usage হতে পারে। Public Worker-এর জন্য Cloudflare rate limiting, Turnstile বা user auth যুক্ত করো: CORS একা abuse ঠেকায় না।
