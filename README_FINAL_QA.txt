Japanese Ai Ebook — Final QA (Design Unchanged)
================================================
Date: 2026-10-21

INCLUDED FILES
- index.html — Complete single-page website
- assets/cover-phone.webp — Approved mobile cover
- assets/cover-ipad.webp — Approved tablet cover
- assets/cover-laptop.webp — Approved desktop cover
- assets/japanese-robot.webp, assets/japanese-banner.webp — Chat/UI images
- worker.js — Original Cloudflare backend code (unchanged)
- wrangler.jsonc — Original Cloudflare Worker configuration (unchanged)

WHAT WAS CHECKED
- Phone (390 x 844), iPad (820 x 1180), laptop (1440 x 900): 30 browser UI/function checks each, passed 90/90.
- Additional viewport checks: 320x568, 428x926, 768x1024, 1024x768, 1366x768 — full cover without scrolling or horizontal overflow; menu remains scrollable.
- Approved cover artwork preserved byte-for-byte in all five asset files.
- Study routes: Basic, Vocabulary L1+L2, Grammar L1+L2, Reading, Kanji + writing canvas, Listening (4 options), JLPT Mock and AI Chat UI.
- Smart Back: Vocabulary Lesson 1 -> AI Chat -> Back -> same Lesson 1 on phone, tablet, laptop.
- Offline/mock response smoke test: AI Chat renders simulated Bengali server response correctly.
- Mock Test: verified completed results for Vocabulary, Kanji, Grammar, Reading and Listening; all-lessons selection correctly normalized.
- JavaScript syntax: website and worker pass node --check. Static inline handlers were audited.

BUG FIX (NO DESIGN CHANGES)
- 'Both Lessons' selection ('all') in Vocabulary/Grammar lesson tests now correctly starts both-lesson N5 practice instead of failing.

LIMITS OF TESTING
- Live Gemini API and actual cloud backend network calls were NOT tested here.
- Physical iPhone Safari, Messenger in-app browser, and real Japanese speech playback were NOT tested.
- The quiz questions are practice material, not official JLPT exam papers.

DEPLOY FROM WINDOWS CMD
1. Extract ZIP and copy index.html + assets into C:\Git\Japanese Ai Teacher
2. Open Windows CMD and run:

cd /d "C:\Git\Japanese Ai Teacher"
git add index.html assets
git commit -m "Final QA fix without changing Japanese Ebook design"
git push origin main

No Cloudflare Worker redeployment is required: worker.js was not changed.

BENGALI QUICK GUIDE / সহজ ব্যবহার
Start Now → Book Menu → বিষয় নির্বাচন → Lesson 1 বা 2 → পড়া → Mock Test
AI Chat → ← Back চাপলে আগের Lesson-এ ফিরে যাবে।
প্রথম Cover পেজে Scroll বন্ধ; Lesson পেজে স্বাভাবিক Scroll থাকবে।
