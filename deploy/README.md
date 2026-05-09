# Backend Deployment

This repository ships a GitHub-first backend delivery flow:

- `backend-ci.yml`: install, test, and build the NestJS backend
- `backend-image.yml`: build and push `ghcr.io/<owner>/<repo>-backend`
- `backend-deploy.yml`: pull and restart the backend over SSH

## Required GitHub setup

Create two GitHub Environments if you want approval gates:

- `staging`
- `production`

Add these Environment secrets for each target:

- `SSH_HOST`
- `SSH_USER`
- `SSH_KEY`
- `SSH_PORT` optional, defaults to `22`
- `DEPLOY_PATH` remote directory that stores `backend-compose.yml` and `.env`
- `GHCR_USERNAME`
- `GHCR_TOKEN`

Add this optional Environment variable if the public port is not `3000`:

- `BACKEND_PORT`

## Remote server layout

The deploy workflow expects this structure on the server:

```text
$DEPLOY_PATH/
  backend-compose.yml
  .env
```

The workflow uploads `backend-compose.yml`. You are responsible for creating `.env`.

## Minimal remote `.env`

```bash
BACKEND_PORT=3000
GHCR_OWNER=your-org
GHCR_REPOSITORY=po1market
IMAGE_TAG=main
PORT=3000
PO1MARKET_CORS_ORIGIN=https://your-frontend.example.com
PO1MARKET_OPENAI_API_KEY=...
PO1MARKET_OPENAI_MODEL=gpt-4.1-mini
```

`IMAGE_TAG` is overwritten by the deploy workflow, but keeping it in `.env` makes local manual restarts simpler.
