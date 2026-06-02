import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { Header } from "../components/Header";
import { api } from "../lib/api";
import type { Bot, BotFlow, BotNode } from "@shared/types";

/**
 * NusaLingua Studio — no-code chatbot builder.
 *
 * Layout 3-panel:
 *   [Bots list / Components]   [Canvas]   [Properties panel]
 *
 * User flow:
 *   1. Buat bot baru (atau buka existing)
 *   2. Drag-tap node dari palette → nodes array di flow
 *   3. Edit system prompt + temperature + model di Properties panel
 *   4. Save (POST /api/bots) → bot tersimpan di Supabase
 *   5. "Test" tombol → buat conversation berbasis bot ini → buka /chat/:id
 */

const NODE_PALETTE = [
  { type: "trigger" as const, label: "Trigger / Start", icon: "▶", desc: "Pengguna mulai chat" },
  { type: "system_prompt" as const, label: "System Prompt", icon: "✎", desc: "Persona & instruksi AI" },
  { type: "llm_call" as const, label: "LLM Call", icon: "⚡", desc: "Panggil model NusaLingua" },
  { type: "condition" as const, label: "Condition", icon: "⤵", desc: "Eskalasi atau branch" },
  { type: "send_reply" as const, label: "Send Reply", icon: "→", desc: "Kirim balasan ke user" },
  { type: "end" as const, label: "End", icon: "⛔", desc: "Akhiri sesi" },
];

function defaultNodeForType(type: BotNode["type"]): BotNode {
  const id = nanoid(8);
  switch (type) {
    case "trigger":
      return { id, type, channel: "web" };
    case "system_prompt":
      return { id, type, content: "Anda asisten ramah dalam bahasa daerah." };
    case "llm_call":
      return { id, type, model: "nusalingua-core-7b", temperature: 0.6 };
    case "condition":
      return { id, type, expression: "intent == 'complaint'" };
    case "send_reply":
      return { id, type };
    case "end":
      return { id, type };
  }
}

const DEFAULT_FLOW: BotFlow = {
  systemPrompt:
    "Anda adalah asisten ramah Disdukcapil. Balas dalam bahasa daerah yang sopan. Selalu mengonfirmasi sebelum memberikan informasi sensitif.",
  temperature: 0.6,
  maxTokens: 400,
  welcomeMessage: "Sugeng rawuh! Wonten ingkang saged kula bantu?",
  tags: ["dukcapil", "layanan-publik"],
  nodes: [
    defaultNodeForType("trigger"),
    defaultNodeForType("system_prompt"),
    defaultNodeForType("llm_call"),
    defaultNodeForType("send_reply"),
  ],
};

export default function Studio() {
  const { botId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Bot>>({
    name: "Chatbot Baru",
    languageCode: "su",
    flow: DEFAULT_FLOW,
    status: "draft",
  });

  // Load list of bots
  const { data: bots = [] } = useQuery({
    queryKey: ["bots"],
    queryFn: () => api.listBots(),
  });

  const { data: languages = [] } = useQuery({
    queryKey: ["languages"],
    queryFn: () => api.listLanguages(),
  });

  // Load specific bot kalau ada botId
  const { data: currentBot } = useQuery({
    queryKey: ["bot", botId],
    queryFn: () => api.getBot(botId!),
    enabled: !!botId,
  });
  useEffect(() => {
    if (currentBot) setDraft(currentBot);
  }, [currentBot]);

  // ============================================
  // MUTATIONS
  // ============================================

  const saveMutation = useMutation({
    mutationFn: async (): Promise<Bot> => {
      if (!draft.name || !draft.languageCode || !draft.flow) {
        throw new Error("Nama, bahasa, dan flow wajib diisi");
      }
      if (botId) {
        return api.updateBot(botId, {
          name: draft.name,
          description: draft.description ?? null,
          languageCode: draft.languageCode,
          flow: draft.flow,
          status: draft.status as Bot["status"],
        });
      }
      return api.createBot({
        name: draft.name,
        description: draft.description ?? undefined,
        languageCode: draft.languageCode,
        flow: draft.flow,
        status: (draft.status as Bot["status"]) ?? "draft",
      });
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      qc.invalidateQueries({ queryKey: ["bot", saved.id] });
      navigate(`/studio/${saved.id}`, { replace: true });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteBot(botId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      navigate("/studio");
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      if (!botId) {
        const saved = await saveMutation.mutateAsync();
        return api.createConversation({
          languageCode: saved.languageCode,
          botId: saved.id,
          title: `Test: ${saved.name}`,
        });
      }
      return api.createConversation({
        languageCode: draft.languageCode!,
        botId,
        title: `Test: ${draft.name}`,
      });
    },
    onSuccess: (convo) => {
      navigate(`/chat/${convo.id}`);
    },
  });

  // ============================================
  // FLOW EDITING
  // ============================================

  const flow = draft.flow ?? DEFAULT_FLOW;
  const selectedNode = useMemo(
    () => flow.nodes.find((n) => n.id === selectedId) ?? null,
    [flow.nodes, selectedId]
  );

  function setFlow(patch: Partial<BotFlow>) {
    setDraft((d) => ({
      ...d,
      flow: { ...(d.flow ?? DEFAULT_FLOW), ...patch },
    }));
  }

  function addNode(type: BotNode["type"]) {
    const node = defaultNodeForType(type);
    setFlow({ nodes: [...flow.nodes, node] });
    setSelectedId(node.id);
  }

  function removeNode(id: string) {
    setFlow({ nodes: flow.nodes.filter((n) => n.id !== id) });
    if (selectedId === id) setSelectedId(null);
  }

  function updateNode(id: string, patch: Partial<BotNode>) {
    setFlow({
      nodes: flow.nodes.map((n) => (n.id === id ? ({ ...n, ...patch } as BotNode) : n)),
    });
  }

  function moveNode(id: string, dir: -1 | 1) {
    const idx = flow.nodes.findIndex((n) => n.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= flow.nodes.length) return;
    const next = [...flow.nodes];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setFlow({ nodes: next });
  }

  // ============================================
  // RENDER
  // ============================================

  const isExisting = !!botId;

  return (
    <div className="h-screen flex flex-col">
      <Header
        showCta={false}
        rightSlot={
          <>
            <button
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
              className="btn-outline btn-sm"
            >
              ▶ {testMutation.isPending ? "Membuka..." : "Test Bot"}
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="btn-primary btn-sm"
            >
              {saveMutation.isPending
                ? "Menyimpan..."
                : isExisting
                ? "Simpan Perubahan"
                : "Simpan Bot"}
            </button>
          </>
        }
      />

      {saveMutation.isError && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 text-sm px-6 py-2">
          ⚠ {(saveMutation.error as Error).message}
        </div>
      )}

      <div className="grid grid-cols-[260px_1fr_320px] flex-1 min-h-0">
        {/* LEFT: Palette + bots list */}
        <aside className="bg-stone-50 border-r border-line p-4 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold mb-2">
            Bot Kamu ({bots.length})
          </div>
          <button
            onClick={() => navigate("/studio")}
            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white mb-2"
          >
            + Bot Baru
          </button>
          {bots.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/studio/${b.id}`)}
              className={`w-full text-left px-3 py-2 text-xs rounded-lg mb-1 transition-colors ${
                b.id === botId
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-ink-soft hover:bg-primary-50 hover:text-primary"
              }`}
            >
              ▦ {b.name}
              <div className="text-[10px] text-ink-mute">{b.languageCode} · {b.status}</div>
            </button>
          ))}

          <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold mt-6 mb-2">
            Components
          </div>
          {NODE_PALETTE.map((c) => (
            <button
              key={c.type}
              onClick={() => addNode(c.type)}
              className="w-full text-left bg-white border border-line rounded-xl px-3 py-2.5 mb-2 hover:border-primary group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary flex items-center justify-center font-extrabold text-xs">
                  {c.icon}
                </div>
                <div>
                  <div className="text-xs font-bold">{c.label}</div>
                  <div className="text-[10px] text-ink-mute">{c.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </aside>

        {/* CENTER: Canvas */}
        <main className="bg-stone-100 overflow-y-auto p-6">
          <div className="mb-4">
            <input
              value={draft.name ?? ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Nama bot..."
              className="text-lg font-extrabold bg-transparent outline-none w-full mb-1"
            />
            <input
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Deskripsi singkat..."
              className="text-xs text-ink-mute bg-transparent outline-none w-full"
            />
          </div>

          <div
            className="bg-white border-2 border-dashed border-line rounded-2xl min-h-[70vh] p-8"
            style={{
              backgroundImage: "radial-gradient(#E7E5E4 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            {flow.nodes.length === 0 && (
              <div className="text-center text-ink-mute py-20 text-sm">
                Canvas kosong. Klik component di kiri untuk menambah node.
              </div>
            )}

            {flow.nodes.map((node, idx) => (
              <CanvasNode
                key={node.id}
                node={node}
                selected={node.id === selectedId}
                onSelect={() => setSelectedId(node.id)}
                onDelete={() => removeNode(node.id)}
                onUp={() => moveNode(node.id, -1)}
                onDown={() => moveNode(node.id, 1)}
                isFirst={idx === 0}
                isLast={idx === flow.nodes.length - 1}
              />
            ))}
          </div>
        </main>

        {/* RIGHT: Properties */}
        <aside className="bg-stone-50 border-l border-line p-5 overflow-y-auto">
          <div className="text-sm font-bold mb-3.5">
            {selectedNode ? "Properti Node" : "Properti Bot"}
          </div>

          {selectedNode ? (
            <NodeProperties
              node={selectedNode}
              onChange={(patch) => updateNode(selectedNode.id, patch)}
            />
          ) : (
            <BotProperties
              draft={draft}
              flow={flow}
              languages={languages}
              onDraftChange={setDraft}
              onFlowChange={setFlow}
            />
          )}

          {isExisting && (
            <button
              onClick={() => {
                if (confirm("Yakin hapus bot ini?")) deleteMutation.mutate();
              }}
              className="mt-8 w-full px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
            >
              🗑 Hapus Bot
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function CanvasNode({
  node,
  selected,
  onSelect,
  onDelete,
  onUp,
  onDown,
  isFirst,
  isLast,
}: {
  node: BotNode;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const meta = NODE_PALETTE.find((p) => p.type === node.type)!;
  return (
    <div className="relative max-w-md mx-auto mb-9">
      <div
        onClick={onSelect}
        className={`bg-white border-2 rounded-2xl p-4 cursor-pointer transition-all shadow-sm ${
          selected ? "border-primary shadow-lg" : "border-line hover:border-primary-300"
        }`}
      >
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-1.5">
          {meta.icon} {meta.label}
        </div>
        <div className="text-sm font-bold mb-1">{nodeTitle(node)}</div>
        <div className="text-xs text-ink-soft">{nodeContent(node)}</div>

        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onUp(); }}
            disabled={isFirst}
            className="w-6 h-6 rounded text-xs hover:bg-stone-100 disabled:opacity-30"
          >▲</button>
          <button
            onClick={(e) => { e.stopPropagation(); onDown(); }}
            disabled={isLast}
            className="w-6 h-6 rounded text-xs hover:bg-stone-100 disabled:opacity-30"
          >▼</button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-6 h-6 rounded text-xs hover:bg-red-50 text-red-500"
          >✕</button>
        </div>
      </div>
      {!isLast && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-primary font-extrabold">
          ↓
        </div>
      )}
    </div>
  );
}

function nodeTitle(node: BotNode): string {
  switch (node.type) {
    case "trigger": return `Channel: ${node.channel}`;
    case "system_prompt": return "Persona & instruksi";
    case "llm_call": return `Model: ${node.model}`;
    case "condition": return "Branch logic";
    case "send_reply": return "Kirim balasan ke user";
    case "end": return "Akhiri percakapan";
  }
}
function nodeContent(node: BotNode): string {
  switch (node.type) {
    case "trigger": return "Trigger awal percakapan";
    case "system_prompt": return node.content.slice(0, 80) + (node.content.length > 80 ? "…" : "");
    case "llm_call": return `Temperature: ${node.temperature}`;
    case "condition": return node.expression;
    case "send_reply": return "Balasan otomatis";
    case "end": return "Tutup sesi";
  }
}

function NodeProperties({
  node,
  onChange,
}: {
  node: BotNode;
  onChange: (patch: Partial<BotNode>) => void;
}) {
  switch (node.type) {
    case "trigger":
      return (
        <Field label="Channel">
          <select
            value={node.channel}
            onChange={(e) => onChange({ channel: e.target.value as any })}
            className="input-field"
          >
            <option value="web">Web Chat</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>
        </Field>
      );
    case "system_prompt":
      return (
        <Field label="System Prompt">
          <textarea
            value={node.content}
            onChange={(e) => onChange({ content: e.target.value })}
            className="input-field h-32 resize-none"
            placeholder="Anda adalah..."
          />
        </Field>
      );
    case "llm_call":
      return (
        <>
          <Field label="Model">
            <select
              value={node.model}
              onChange={(e) => onChange({ model: e.target.value })}
              className="input-field"
            >
              <option value="nusalingua-core-1b">NusaLingua Core-1B (Edge)</option>
              <option value="nusalingua-core-7b">NusaLingua Core-7B (Standard)</option>
              <option value="nusalingua-core-70b">NusaLingua Core-70B (Enterprise)</option>
            </select>
          </Field>
          <Field label="Temperature">
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={node.temperature}
              onChange={(e) => onChange({ temperature: Number(e.target.value) })}
              className="input-field"
            />
          </Field>
        </>
      );
    case "condition":
      return (
        <Field label="Expression">
          <input
            value={node.expression}
            onChange={(e) => onChange({ expression: e.target.value })}
            className="input-field"
            placeholder="intent == 'complaint'"
          />
        </Field>
      );
    default:
      return (
        <p className="text-xs text-ink-mute">
          Node "{node.type}" tidak memiliki properti tambahan.
        </p>
      );
  }
}

function BotProperties({
  draft,
  flow,
  languages,
  onDraftChange,
  onFlowChange,
}: {
  draft: Partial<Bot>;
  flow: BotFlow;
  languages: { code: string; name: string; status: string }[];
  onDraftChange: (next: Partial<Bot>) => void;
  onFlowChange: (patch: Partial<BotFlow>) => void;
}) {
  return (
    <>
      <Field label="Bahasa Output">
        <select
          value={draft.languageCode}
          onChange={(e) => onDraftChange({ ...draft, languageCode: e.target.value })}
          className="input-field"
        >
          {languages
            .filter((l) => l.status !== "soon")
            .map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
        </select>
      </Field>
      <Field label="Status">
        <select
          value={draft.status ?? "draft"}
          onChange={(e) => onDraftChange({ ...draft, status: e.target.value as Bot["status"] })}
          className="input-field"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </Field>
      <Field label="System Prompt (override bahasa)">
        <textarea
          value={flow.systemPrompt}
          onChange={(e) => onFlowChange({ systemPrompt: e.target.value })}
          className="input-field h-32 resize-none"
        />
      </Field>
      <Field label="Welcome Message">
        <input
          value={flow.welcomeMessage ?? ""}
          onChange={(e) => onFlowChange({ welcomeMessage: e.target.value })}
          className="input-field"
        />
      </Field>
      <Field label="Temperature">
        <input
          type="number"
          step="0.1"
          min="0"
          max="2"
          value={flow.temperature ?? 0.7}
          onChange={(e) => onFlowChange({ temperature: Number(e.target.value) })}
          className="input-field"
        />
      </Field>
      <Field label="Max Tokens">
        <input
          type="number"
          value={flow.maxTokens ?? 400}
          onChange={(e) => onFlowChange({ maxTokens: Number(e.target.value) })}
          className="input-field"
        />
      </Field>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-mute mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
