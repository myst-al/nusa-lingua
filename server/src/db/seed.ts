import { db, languages } from "./index.js";

/**
 * Seed initial languages. User account dibuat otomatis saat sign-up via Supabase.
 * Run dengan: npm run db:seed
 */

const initialLanguages = [
  {
    code: "id",
    name: "Bahasa Indonesia",
    region: "Nasional",
    speakers: 270_000_000,
    status: "live" as const,
    flag: "ID",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI yang ramah dan informatif. Selalu balas dalam Bahasa Indonesia yang baik dan benar (EYD). Gunakan ekspresi natural Indonesia, hindari struktur kalimat terjemahan langsung dari bahasa Inggris.",
  },
  {
    code: "jv",
    name: "Bahasa Jawa",
    region: "Jawa Tengah, DIY, Jawa Timur",
    speakers: 82_000_000,
    status: "live" as const,
    flag: "JV",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Jawa. Default ke krama alus (sopan). Kalau user pakai ngoko, balas dengan ngoko. Sertakan terjemahan Bahasa Indonesia dalam kurung untuk frasa sulit. Jelaskan unggah-ungguh basa bila relevan.",
  },
  {
    code: "su",
    name: "Bahasa Sunda",
    region: "Jawa Barat, Banten",
    speakers: 40_000_000,
    status: "live" as const,
    flag: "SU",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Sunda. Default ke basa lemes (halus). Bila user pakai loma/kasar, sesuaikan. Sertakan terjemahan Bahasa Indonesia untuk istilah khas Sunda. Hargai unggah-ungguh basa Sunda.",
  },
  {
    code: "bbc",
    name: "Bahasa Batak Toba",
    region: "Sumatra Utara",
    speakers: 2_000_000,
    status: "live" as const,
    flag: "BT",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Batak Toba. Sertakan terjemahan Bahasa Indonesia. Jelaskan konteks budaya Batak bila relevan (marga, adat, dll).",
  },
  {
    code: "bug",
    name: "Bahasa Bugis",
    region: "Sulawesi Selatan",
    speakers: 5_000_000,
    status: "beta" as const,
    flag: "BG",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Bugis. Sertakan terjemahan Bahasa Indonesia. Hargai kearifan budaya Bugis (siri', pesse, La Galigo).",
  },
  {
    code: "day",
    name: "Bahasa Dayak Ngaju",
    region: "Kalimantan Tengah",
    speakers: 1_000_000,
    status: "beta" as const,
    flag: "DY",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Dayak Ngaju. Sertakan terjemahan Bahasa Indonesia. Jelaskan konteks budaya Dayak bila relevan.",
  },
  {
    code: "min",
    name: "Bahasa Minangkabau",
    region: "Sumatra Barat",
    speakers: 5_000_000,
    status: "soon" as const,
    flag: "MN",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Minangkabau. Sertakan terjemahan Bahasa Indonesia.",
  },
  {
    code: "ban",
    name: "Bahasa Bali",
    region: "Bali",
    speakers: 3_300_000,
    status: "soon" as const,
    flag: "BL",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Bali. Hormati tingkatan basa Bali (alus singgih, alus madya, ketah).",
  },
];

async function main() {
  console.log("🌱 Seeding languages...");

  for (const lang of initialLanguages) {
    await db
      .insert(languages)
      .values(lang)
      .onConflictDoUpdate({
        target: languages.code,
        set: {
          name: lang.name,
          region: lang.region,
          speakers: lang.speakers,
          status: lang.status,
          flag: lang.flag,
          systemPrompt: lang.systemPrompt,
        },
      });
    console.log(`  ✓ ${lang.code} — ${lang.name}`);
  }

  console.log("\n✅ Seed complete!");
  console.log("   User account dibuat otomatis saat sign-up via Supabase Auth.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
