# GitHub Secrets Setup (Production)

This project does not commit `.env` to GitHub (by design).  
Use GitHub encrypted secrets instead.

## 1) Add repository secrets

In your repository:
`Settings -> Secrets and variables -> Actions -> New repository secret`

Add these secret names:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_DB_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `APP_URL`
- `EXCHANGE_RATE_API_KEY`
- `IPSTACK_API_KEY`
- `GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_ID`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `ENQUIRY_NOTIFY_EMAILS`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `ENQUIRY_NOTIFY_WHATSAPP`

## 2) Run the production workflow

Workflow file:
`.github/workflows/production-secrets.yml`

From GitHub:
`Actions -> Production Build (GitHub Secrets) -> Run workflow`

This workflow:
- Loads values from GitHub Secrets (no `.env` commit needed)
- Validates required keys
- Runs `npm ci`
- Runs `npm run build`
- Runs `npm run lint`

## 3) Important deployment note

GitHub Secrets are available only inside GitHub Actions workflows.  
For your live hosting platform (Render, Railway, VPS, etc.), add the same variables in that platform's environment settings as well.
