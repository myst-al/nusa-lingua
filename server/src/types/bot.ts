// Type definition untuk Bot Flow.
// Disimpan sebagai JSONB di kolom `bots.flow`.

export interface BotFlow {
  /** System prompt yang inject ke LLM. Override language.systemPrompt. */
  systemPrompt: string;

  /** OpenAI model temperature (0.0–2.0). */
  temperature?: number;

  /** Max tokens response. */
  maxTokens?: number;

  /** Node-node visual yang dibangun di Studio (untuk render canvas). */
  nodes: BotNode[];

  /** Welcome message yang muncul saat user pertama buka chatbot. */
  welcomeMessage?: string;

  /** Tag/kategori. */
  tags?: string[];
}

export type BotNode =
  | { id: string; type: "trigger"; channel: "web" | "whatsapp" | "telegram" }
  | { id: string; type: "system_prompt"; content: string }
  | { id: string; type: "llm_call"; model: string; temperature: number }
  | { id: string; type: "condition"; expression: string }
  | { id: string; type: "send_reply" }
  | { id: string; type: "end" };
