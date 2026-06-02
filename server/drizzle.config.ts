import "dotenv/config";
import dotenv from "dotenv";
import path from "node:path";
import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Load .env berlapis: server/.env → ../.env (root) — yang ditemukan duluan menang.
for (const p of [".env", "../.env", "../../.env"]) {
  const full = path.resolve(p);
  if (existsSync(full)) {
    dotenv.config({ path: full, override: false });
    console.log(`[drizzle.config] loaded ${full}`);
    break;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL kosong. Pastikan .env ada di nusalingua/ atau nusalingua/server/ " +
      "dan berisi baris: DATABASE_URL=postgresql://...:6543/postgres"
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
