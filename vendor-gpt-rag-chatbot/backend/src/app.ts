import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { z } from "zod";

import { GroqChatClient, GroqClientError } from "./rag/groqClient.js";
import { TfidfRetriever } from "./rag/retriever.js";
import { RagChatService } from "./rag/service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// __dirname-relative resolves correctly for local `pnpm dev` (tsx runs
// src/app.ts directly) and for the Docker image (dist/app.js sits next to
// kb/ after `npm run build`). On Vercel the file gets bundled/relocated, so
// __dirname at runtime no longer points at a useful location -- fall back to
// process.cwd(), which Vercel sets to the function's project root. We also
// declare kb/** in vercel.json's `includeFiles` so it's bundled regardless of
// which of these static-analysis paths Vercel's bundler manages to trace.
const KB_PATH_CANDIDATES = [
  path.join(__dirname, "..", "kb", "knowledge_base.json"),
  path.join(process.cwd(), "kb", "knowledge_base.json"),
];
const KB_PATH =
  KB_PATH_CANDIDATES.find((p) => fs.existsSync(p)) ?? KB_PATH_CANDIDATES[0];

const PORT = Number(process.env.PORT ?? 8000);

const app = express();
app.use(express.json({ limit: "50kb" }));

// Lock this down to your real domain(s) in production, e.g.
// ALLOWED_ORIGINS="https://vendor-gpt.com,https://www.vendor-gpt.com"
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "*")
  .split(",")
  .map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    methods: ["GET", "POST"],
  })
);

const retriever = new TfidfRetriever(KB_PATH);

let service: RagChatService | null = null;
let initError: string | null = null;
try {
  const groqClient = new GroqChatClient();
  service = new RagChatService(retriever, groqClient);
} catch (err) {
  // Don't crash the process on a missing key -- surface a clear 503 on
  // /api/chat instead, so the rest of the site (and health checks) keep working.
  initError = (err as Error).message;
}

const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .default([]),
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", groq_configured: service !== null });
});

app.post("/api/chat", async (req: Request, res: Response) => {
  if (!service) {
    res.status(503).json({ detail: initError ?? "Chat service unavailable." });
    return;
  }

  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ detail: parsed.error.flatten() });
    return;
  }

  try {
    const result = await service.answer(parsed.data.message, parsed.data.history);
    res.json(result);
  } catch (err) {
    if (err instanceof GroqClientError) {
      res.status(502).json({ detail: err.message });
      return;
    }
    res.status(500).json({ detail: "Unexpected server error." });
  }
});

// On Vercel, this module is imported by api/index.ts and invoked as a
// serverless function per-request -- there's no long-running process to
// bind a port to, and calling listen() there is unnecessary (Vercel sets
// the VERCEL env var automatically at runtime). Local `pnpm dev` and the
// Docker image both still start a normal server.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Vendor-GPT chatbot backend listening on port ${PORT}`);
  });
}

export default app;
