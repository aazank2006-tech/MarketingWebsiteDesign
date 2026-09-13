// Vercel serverless function entrypoint.
//
// Vercel auto-detects any file under /api as a function and calls its
// default export as a standard Node (req, res) handler. Express apps are
// already callable with that exact signature, so we just re-export the app
// built in src/app.ts -- no separate framework adapter needed.
//
// This file is only used by Vercel. Local development (`pnpm dev`) and the
// Docker image both run src/app.ts directly and never touch this file.
import app from "../src/app.js";

export default app;
