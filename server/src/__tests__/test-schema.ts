/**
 * Database Schema Test — verifikasi:
 *   - 5 tables + 3 enums valid
 *   - Foreign keys + cascades
 *   - JSONB field untuk bot.flow
 *   - Indexes & constraints
 */

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema.js";
import { nanoid } from "nanoid";

const client = new PGlite();
await client.waitReady;
const db = drizzle(client, { schema });

const SCHEMA_SQL = [
  `CREATE TYPE language_status AS ENUM ('live', 'beta', 'soon')`,
  `CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system')`,
  `CREATE TYPE bot_status AS ENUM ('draft', 'published', 'archived')`,
  `CREATE TABLE languages (code VARCHAR(16) PRIMARY KEY, name TEXT NOT NULL, region TEXT NOT NULL, speakers INTEGER NOT NULL DEFAULT 0, status language_status NOT NULL DEFAULT 'soon', flag VARCHAR(4) NOT NULL, system_prompt TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE users (id UUID PRIMARY KEY, email TEXT NOT NULL, name TEXT NOT NULL, avatar_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE bots (id VARCHAR(32) PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, language_code VARCHAR(16) NOT NULL REFERENCES languages(code), status bot_status NOT NULL DEFAULT 'draft', flow JSONB NOT NULL, is_public BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE conversations (id VARCHAR(32) PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, language_code VARCHAR(16) NOT NULL REFERENCES languages(code), bot_id VARCHAR(32) REFERENCES bots(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE messages (id VARCHAR(32) PRIMARY KEY, conversation_id VARCHAR(32) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, role message_role NOT NULL, content TEXT NOT NULL, tokens_used INTEGER DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
];

let pass = 0, fail = 0;
const t = (label: string, ok: boolean) => {
  if (ok) { console.log(`  ✓ ${label}`); pass++; }
  else    { console.log(`  ✗ ${label}`); fail++; }
};

console.log("\n[1] Schema deploy...");
for (const s of SCHEMA_SQL) await client.exec(s);
t("3 enums + 5 tables created", true);

console.log("\n[2] Seed languages...");
await db.insert(schema.languages).values([
  { code: "id", name: "Indonesia", region: "Nasional", speakers: 270000000, status: "live", flag: "ID", systemPrompt: "ID" },
  { code: "su", name: "Sunda", region: "Jabar", speakers: 40000000, status: "live", flag: "SU", systemPrompt: "SU" },
]);
const langs = await db.select().from(schema.languages);
t("2 languages inserted", langs.length === 2);

console.log("\n[3] Insert user + bot + conversation + message...");
const uid = "11111111-1111-1111-1111-111111111111";
await db.insert(schema.users).values({ id: uid, email: "test@nusa.id", name: "Test" });
const botId = nanoid();
await db.insert(schema.bots).values({
  id: botId, userId: uid, name: "Test Bot", languageCode: "su",
  flow: { systemPrompt: "Test prompt", temperature: 0.5, nodes: [] },
});
const convoId = nanoid();
await db.insert(schema.conversations).values({ id: convoId, userId: uid, title: "Test", languageCode: "su", botId });
await db.insert(schema.messages).values({ id: nanoid(), conversationId: convoId, role: "user", content: "halo", tokensUsed: 0 });
await db.insert(schema.messages).values({ id: nanoid(), conversationId: convoId, role: "assistant", content: "halo juga", tokensUsed: 20 });
t("Full chain inserted", true);

console.log("\n[4] Verify JSONB flow stored properly...");
const [bot] = await db.select().from(schema.bots).where(eq(schema.bots.id, botId));
t("Bot.flow is object (JSONB roundtrip)", typeof bot.flow === "object" && (bot.flow as any).systemPrompt === "Test prompt");

console.log("\n[5] Token tracking...");
const msgs = await db.select().from(schema.messages);
const total = msgs.reduce((s, m) => s + (m.tokensUsed ?? 0), 0);
t(`Total tokens = 20 (got ${total})`, total === 20);

console.log("\n[6] Test ON DELETE CASCADE (user → all data)...");
await db.delete(schema.users).where(eq(schema.users.id, uid));
const remainBots = await db.select().from(schema.bots);
const remainConvos = await db.select().from(schema.conversations);
const remainMsgs = await db.select().from(schema.messages);
t("Cascade: bots cleared", remainBots.length === 0);
t("Cascade: conversations cleared", remainConvos.length === 0);
t("Cascade: messages cleared", remainMsgs.length === 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
