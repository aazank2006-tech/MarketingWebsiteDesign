# Deploying this backend to Vercel

The code changes in this update (`api/index.ts`, `vercel.json`, and the
`app.ts` tweaks) make this Express app deployable as a Vercel serverless
function. Replace your existing `backend/` folder with this one, push it,
then do the following **in the Vercel dashboard** -- these can't be fixed by
code alone.

## 1. Confirm the project's Root Directory

In your Vercel project: **Settings -> General -> Root Directory**. It must
point at this `backend/` folder (not the repo root, and not the frontend).
If it's wrong, requests will never reach this code no matter what else is
correct.

## 2. Add environment variables

**Settings -> Environment Variables** -- add these for both the
**Production** and **Preview** environments:

| Key | Value |
|---|---|
| `GROQ_API_KEY` | your real key from console.groq.com/keys |
| `GROQ_MODEL` | `openai/gpt-oss-120b` (or your preferred model) |
| `GROQ_TEMPERATURE` | `0.2` |
| `GROQ_MAX_TOKENS` | `500` |
| `ALLOWED_ORIGINS` | your live site's exact domain, e.g. `https://your-site.figma.site` |
| `RAG_OUT_OF_SCOPE_THRESHOLD` | `0.08` |

Your local `.env` file is never uploaded when you deploy -- these have to be
entered here separately, once.

`ALLOWED_ORIGINS` matters: it must be the **exact** origin your site is
served from (protocol + domain, no trailing slash, comma-separate if there's
more than one). A mismatch here causes CORS failures that look identical to
every other "something went wrong" case in the browser.

## 3. Redeploy

Environment variable changes don't apply retroactively -- trigger a new
deployment after adding them (push a commit, or use the "Redeploy" button on
the latest deployment).

## 4. Verify the backend directly

Once deployed, open `https://<your-backend>.vercel.app/api/health` in a
browser. You should see:

```json
{ "status": "ok", "groq_configured": true }
```

- Connection error / 404 -> Root Directory or the rewrite is misconfigured.
- `groq_configured: false` -> `GROQ_API_KEY` isn't set, or you deployed
  before adding it.

## 5. Point the frontend at this backend

Wherever the frontend's `VITE_CHAT_API_URL` is set, it currently likely
points at `http://localhost:8000`. Update it to your real backend URL:

```
VITE_CHAT_API_URL=https://<your-backend>.vercel.app
```

Then rebuild/republish the frontend -- Vite bakes env vars in at build time,
so this requires a fresh build, not just a page refresh.
