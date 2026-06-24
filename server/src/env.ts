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
  PORT: z.coerce.number().default(6100),
  DATABASE_URL: z.string().min(10),

  // Pemilih provider AI untuk chat
  AI_PROVIDER: z.enum(["sealion", "groq", "openai"]).optional(),

  // SEA-LION / Sahabat-AI - model AI kawasan (Indonesia/ASEAN), OpenAI-compatible.
  // Jadi provider default kalau SEA_LION_API_KEY di-set.
  // Key gratis: https://playground.sea-lion.ai (API Key Manager).
  SEA_LION_API_KEY: z.string().optional(),
  SEA_LION_BASE_URL: z.string().default("https://api.sea-lion.ai/v1"),
  SEA_LION_CHAT_MODEL: z.string().default("aisingapore/Llama-SEA-LION-v3-70B-IT"),

  // Groq (gratis, cepat) - fallback chat.
  GROQ_API_KEY: z.string().optional(),
  GROQ_CHAT_MODEL: z.string().default("llama-3.3-70b-versatile"),

  // OpenAI - wajib untuk Voice (Realtime API); bisa juga jadi provider chat.
  OPENAI_API_KEY: z.string().min(10, "OPENAI_API_KEY required (untuk voice)"),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_REALTIME_MODEL: z.string().default("gpt-realtime"),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  SUPABASE_JWT_SECRET: z.string().min(10).optional(),

  // CORS
  CLIENT_ORIGIN: z.string().default("http://localhost:6101"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  console.error("");
  console.error("Cari .env di:");
  for (const p of candidates) console.error(`  ${existsSync(p) ? "FOUND" : "missing"}: ${p}`);
  process.exit(1);
}

export const env = parsed.data;
