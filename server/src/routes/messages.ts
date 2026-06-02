import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq, asc, and } from "drizzle-orm";
import { db, conversations, messages, languages, bots } from "../db/index.js";
import { aiClient as openai, CHAT_MODEL } from "../services/ai.js";
import { requireAuth } from "../middleware/auth.js";
import type { BotFlow } from "../types/bot.js";

export const messagesRouter = Router();

const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});

/**
 * POST /api/conversations/:id/messages
 *
 * Response: SSE stream of events:
 *   event: delta   -> { content: "..." }
 *   event: done    -> { messageId: "...", tokensUsed: 123 }
 *   event: error   -> { error: "..." }
 */
messagesRouter.post(
  "/conversations/:id/messages",
  requireAuth,
  async (req, res, next) => {
    const conversationId = req.params.id;

    try {
      const body = sendMessageSchema.parse(req.body);

      // 1. Load conversation + verify ownership
      const [convo] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.userId, req.user!.id)
          )
        )
        .limit(1);
      if (!convo) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // 2. Load language
      const [lang] = await db
        .select()
        .from(languages)
        .where(eq(languages.code, convo.languageCode))
        .limit(1);
      if (!lang) {
        return res.status(400).json({ error: "Language not configured" });
      }

      // 3. Build system prompt — prioritas: bot.flow.systemPrompt > language.systemPrompt
      let systemPrompt = lang.systemPrompt;
      let model = CHAT_MODEL;
      let temperature = 0.7;
      let maxTokens: number | undefined;

      if (convo.botId) {
        const [bot] = await db
          .select()
          .from(bots)
          .where(eq(bots.id, convo.botId))
          .limit(1);
        if (bot?.flow) {
          const flow = bot.flow as BotFlow;
          if (flow.systemPrompt) systemPrompt = flow.systemPrompt;
          if (flow.temperature !== undefined) temperature = flow.temperature;
          if (flow.maxTokens) maxTokens = flow.maxTokens;
        }
      }

      // 4. Insert user message
      const userMsgId = nanoid();
      await db.insert(messages).values({
        id: userMsgId,
        conversationId,
        role: "user",
        content: body.content,
      });

      // 5. Load history (max 20 terakhir, sederhanakan untuk MVP)
      const history = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));

      const messagesForAPI = [
        { role: "system" as const, content: systemPrompt },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ];

      // 6. SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders?.();

      const sendEvent = (type: string, data: unknown) => {
        res.write(`event: ${type}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      // 7. Stream OpenAI completion
      let fullContent = "";
      let tokensUsed = 0;

      try {
        const stream = await openai.chat.completions.create({
          model,
          messages: messagesForAPI,
          temperature,
          max_tokens: maxTokens,
          stream: true,
          stream_options: { include_usage: true },
        });

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            sendEvent("delta", { content: delta });
          }
          if (chunk.usage) {
            tokensUsed = chunk.usage.total_tokens ?? 0;
          }
        }

        const assistantMsgId = nanoid();
        await db.insert(messages).values({
          id: assistantMsgId,
          conversationId,
          role: "assistant",
          content: fullContent,
          tokensUsed,
        });

        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, conversationId));

        sendEvent("done", { messageId: assistantMsgId, tokensUsed });
        res.end();
      } catch (apiErr) {
        console.error("OpenAI error:", apiErr);
        sendEvent("error", {
          error: apiErr instanceof Error ? apiErr.message : "OpenAI request failed",
        });
        res.end();
      }
    } catch (err) {
      if (!res.headersSent) {
        next(err);
      } else {
        res.end();
      }
    }
  }
);
