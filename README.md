<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/75adf731-e98b-40b4-9d9b-772768b1b272

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `ANTHROPIC_API_KEY` in `.env` to your Anthropic API key (this powers the chatbot at `/api/ai/chat`). See [.env.example](.env.example) for all required variables.
3. Run the app locally:
   `npm run dev`

## Production

1. Build the frontend:
   `npm run build`
2. Start the production server:
   `npm start`

This project requires the Node.js backend server to be running in production so `/api/*` routes are available.

## GitHub Secrets (No `.env` commit)

Use encrypted GitHub Secrets for CI/production workflows:
- Setup guide: `docs/GITHUB_SECRETS_SETUP.md`
- Workflow: `.github/workflows/production-secrets.yml`
