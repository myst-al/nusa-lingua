import dotenv from "dotenv";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const here = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(here, "../../.env"),
  path.resolve(here, "../../../.env"),
];
for (const p of candidates) {
  if (existsSync(p)) {
    dotenv.config({ path: p, override: false });
    if (process.env.NODE_ENV !== "test") console.log(`[env] loaded ${p}`);
    break;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(10),

  // AI provider selector
  AI_PROVIDER: z.enum(["groq", "openai"]).optional(),

  // Groq (free tier) — opsional. Kalau set, jadi default provider.
  GROQ_API_KEY: z.string().optional(),
  GROQ_CHAT_MODEL: z.string().default("llama-3.3-70b-versatile"),

  // OpenAI — wajib untuk voice (Realtime API).
  OPENAI_API_KEY: z.string().min(10, "OPENAI_API_KEY required (untuk voice)"),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_REALTIME_MODEL: z.string().default("gpt-realtime"),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  SUPABASE_JWT_SECRET: z.string().min(10).optional(),

  // CORS
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  console.error("");
  console.error("Cari .env di:");
  for (const p of candidates) console.error(`  ${existsSync(p) ? "FOUND" : "missing"}: ${p}`);
  process.exit(1);
}

export const env = parsed.data;
