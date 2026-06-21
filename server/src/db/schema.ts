import {
  pgTable,
  text,
  integer,
  timestamp,
  varchar,
  pgEnum,
  uuid,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const languageStatusEnum = pgEnum("language_status", ["live", "beta", "soon"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);
export const botStatusEnum = pgEnum("bot_status", ["draft", "published", "archived"]);

// ============================================
// LANGUAGES
// ============================================

export const languages = pgTable("languages", {
  code: varchar("code", { length: 16 }).primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  speakers: integer("speakers").notNull().default(0),
  status: languageStatusEnum("status").notNull().default("soon"),
  flag: varchar("flag", { length: 4 }).notNull(),
  systemPrompt: text("system_prompt").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Language = typeof languages.$inferSelect;
export type NewLanguage = typeof languages.$inferInsert;

// ============================================
// USERS
//
// Mirror dari Supabase auth.users (id = UUID).
// Kita simpan metadata tambahan di sini (name, avatar, dll).
// Row dibuat otomatis oleh requireAuth middleware saat user pertama kali login.
// ============================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // sama dengan auth.users.id
  email: text("email").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  trialStartedAt: timestamp("trial_started_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ============================================
// CONVERSATIONS
// ============================================

export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 32 }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  languageCode: varchar("language_code", { length: 16 })
    .notNull()
    .references(() => languages.code),
  botId: varchar("bot_id", { length: 32 }).references(() => bots.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

// ============================================
// MESSAGES
// ============================================

export const messages = pgTable("messages", {
  id: varchar("id", { length: 32 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 32 })
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

// ============================================
// BOTS (NusaLingua Studio — no-code chatbot builder)
//
// `flow` menyimpan blueprint: trigger, system prompt, model config, dll.
// Schema-less (JSON) untuk fleksibilitas Studio.
// ============================================

export const bots = pgTable("bots", {
  id: varchar("id", { length: 32 }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  languageCode: varchar("language_code", { length: 16 })
    .notNull()
    .references(() => languages.code),
  status: botStatusEnum("status").notNull().default("draft"),
  flow: jsonb("flow").notNull(), // BotFlow type (shared/types.ts)
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type Bot = typeof bots.$inferSelect;
export type NewBot = typeof bots.$inferInsert;

// ============================================
// API KEYS (untuk developer di Phase 2)
// ============================================

export const apiKeys = pgTable("api_keys", {
  id: varchar("id", { length: 32 }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  prefix: varchar("prefix", { length: 16 }).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
