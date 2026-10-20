Japanese AI Teacher connected to existing Cloudflare Worker.
Worker endpoint: https://gakuen-chatbot-ai.ridoy-gakuen-ai.workers.dev/chat
This Worker uses GEMINI_API_KEY for /chat; OPENAI_API_KEY is not used in this code.
IMPORTANT: This worker is currently designed for TTC school festival, not exclusively Japanese teaching. To specialize responses for beginners, create a separate worker or revise its prompt after checking its other uses.
Upload index.html to GitHub Pages. Never commit secret API keys.
If request errors: check browser developer console, Worker logs, GEMINI_API_KEY, GEMINI_MODEL and CORS origin.
