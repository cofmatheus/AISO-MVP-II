<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4e0668b6-6d20-4495-90c0-405a322f9232

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set the `GEMINI_API_KEY` value
3. Run the app:
   `npm run dev`

### Gemini API
- Your server reads `.env` and `.env.local` for `GEMINI_API_KEY`
- If the key is missing, `/api/chat` and `/api/gemini-advice` will return an error explaining the missing configuration
- Use the `generateAisoAdvice` helper in `src/lib/gemini.ts` to call `/api/gemini-advice` from the frontend
