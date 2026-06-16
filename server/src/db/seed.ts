import { db, languages } from "./index.js";

/**
 * Seed languages NusaLingua.
 *
 * - `core`      : 8 bahasa utama dengan system prompt khusus (status live/beta/soon).
 * - `regional`  : 100+ bahasa daerah Nusantara (status "soon"), system prompt digenerate.
 *
 * Idempotent: onConflictDoUpdate by `code` → aman dijalankan berkali-kali (tidak dobel).
 * Run: npm run db:seed
 *
 * CATATAN DATA:
 *  - `code` mengikuti ISO 639-3 di mana tersedia (sebagian memakai kode pendek lokal).
 *  - `speakers` adalah ANGKA APROKSIMASI (basis Ethnologue/BPS) — verifikasi dulu
 *    sebelum dipakai untuk publikasi/laporan resmi.
 */

type Status = "live" | "beta" | "soon";

interface SeedLanguage {
  code: string;
  name: string;
  region: string;
  speakers: number;
  status: Status;
  flag: string;
  systemPrompt: string;
}

// ============================================================
// 8 bahasa inti — system prompt khusus (dipertahankan)
// ============================================================
const core: SeedLanguage[] = [
  {
    code: "id",
    name: "Bahasa Indonesia",
    region: "Nasional",
    speakers: 270_000_000,
    status: "live",
    flag: "ID",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI yang ramah dan informatif. Selalu balas dalam Bahasa Indonesia yang baik dan benar (EYD). Gunakan ekspresi natural Indonesia, hindari struktur kalimat terjemahan langsung dari bahasa Inggris.",
  },
  {
    code: "jv",
    name: "Bahasa Jawa",
    region: "Jawa Tengah, DIY, Jawa Timur",
    speakers: 82_000_000,
    status: "live",
    flag: "JV",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Jawa. Default ke krama alus (sopan). Kalau user pakai ngoko, balas dengan ngoko. Sertakan terjemahan Bahasa Indonesia dalam kurung untuk frasa sulit. Jelaskan unggah-ungguh basa bila relevan.",
  },
  {
    code: "su",
    name: "Bahasa Sunda",
    region: "Jawa Barat, Banten",
    speakers: 40_000_000,
    status: "live",
    flag: "SU",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Sunda. Default ke basa lemes (halus). Bila user pakai loma/kasar, sesuaikan. Sertakan terjemahan Bahasa Indonesia untuk istilah khas Sunda. Hargai unggah-ungguh basa Sunda.",
  },
  {
    code: "bbc",
    name: "Bahasa Batak Toba",
    region: "Sumatra Utara",
    speakers: 2_000_000,
    status: "live",
    flag: "BT",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Batak Toba. Sertakan terjemahan Bahasa Indonesia. Jelaskan konteks budaya Batak bila relevan (marga, adat, dll).",
  },
  {
    code: "bug",
    name: "Bahasa Bugis",
    region: "Sulawesi Selatan",
    speakers: 5_000_000,
    status: "beta",
    flag: "BG",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Bugis. Sertakan terjemahan Bahasa Indonesia. Hargai kearifan budaya Bugis (siri', pesse, La Galigo).",
  },
  {
    code: "day",
    name: "Bahasa Dayak Ngaju",
    region: "Kalimantan Tengah",
    speakers: 1_000_000,
    status: "beta",
    flag: "DY",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Dayak Ngaju. Sertakan terjemahan Bahasa Indonesia. Jelaskan konteks budaya Dayak bila relevan.",
  },
  {
    code: "min",
    name: "Bahasa Minangkabau",
    region: "Sumatra Barat",
    speakers: 5_000_000,
    status: "soon",
    flag: "MN",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Minangkabau. Sertakan terjemahan Bahasa Indonesia.",
  },
  {
    code: "ban",
    name: "Bahasa Bali",
    region: "Bali",
    speakers: 3_300_000,
    status: "soon",
    flag: "BL",
    systemPrompt:
      "Anda adalah NusaLingua, asisten AI berbahasa Bali. Hormati tingkatan basa Bali (alus singgih, alus madya, ketah).",
  },
];

// ============================================================
// 100+ bahasa daerah — [code, name, region, speakers]
// Status "soon", system prompt digenerate dari template.
// ============================================================
const regionalData: [string, string, string, number][] = [
  // ───────── Sumatra ─────────
  ["ace", "Bahasa Aceh", "Aceh", 3_500_000],
  ["gay", "Bahasa Gayo", "Aceh (Dataran Tinggi Gayo)", 300_000],
  ["btz", "Bahasa Alas-Kluet", "Aceh (Aceh Tenggara)", 100_000],
  ["smr", "Bahasa Simeulue", "Aceh (Pulau Simeulue)", 30_000],
  ["btx", "Bahasa Batak Karo", "Sumatra Utara", 1_200_000],
  ["bts", "Bahasa Batak Simalungun", "Sumatra Utara", 1_200_000],
  ["btm", "Bahasa Batak Mandailing", "Sumatra Utara", 1_100_000],
  ["akb", "Bahasa Batak Angkola", "Sumatra Utara", 750_000],
  ["btd", "Bahasa Batak Pakpak (Dairi)", "Sumatra Utara", 1_200_000],
  ["nia", "Bahasa Nias", "Sumatra Utara (Pulau Nias)", 870_000],
  ["mwv", "Bahasa Mentawai", "Sumatra Barat (Kep. Mentawai)", 60_000],
  ["zlm", "Bahasa Melayu", "Riau, Kepri, pesisir Sumatra", 13_000_000],
  ["mui", "Bahasa Musi (Palembang)", "Sumatra Selatan", 3_900_000],
  ["kge", "Bahasa Komering", "Sumatra Selatan", 700_000],
  ["ogn", "Bahasa Ogan", "Sumatra Selatan", 300_000],
  ["pse", "Bahasa Besemah (Pasemah)", "Sumatra Selatan", 500_000],
  ["rej", "Bahasa Rejang", "Bengkulu", 350_000],
  ["nsy", "Bahasa Nasal", "Bengkulu", 3_500],
  ["eno", "Bahasa Enggano", "Bengkulu (Pulau Enggano)", 1_500],
  ["kvr", "Bahasa Kerinci", "Jambi", 290_000],
  ["jax", "Bahasa Melayu Jambi", "Jambi", 1_000_000],
  ["mfb", "Bahasa Melayu Bangka", "Kep. Bangka Belitung", 340_000],
  ["ljp", "Bahasa Lampung Api", "Lampung", 800_000],
  ["abl", "Bahasa Lampung Nyo", "Lampung", 180_000],

  // ───────── Jawa ─────────
  ["bew", "Bahasa Betawi", "DKI Jakarta", 5_000_000],
  ["mad", "Bahasa Madura", "Jawa Timur (Pulau Madura)", 13_600_000],
  ["osi", "Bahasa Osing", "Banyuwangi, Jawa Timur", 300_000],
  ["tes", "Bahasa Tengger", "Jawa Timur (Bromo-Tengger)", 80_000],
  ["kkv", "Bahasa Kangean", "Jawa Timur (Kep. Kangean)", 110_000],

  // ───────── Bali & Nusa Tenggara ─────────
  ["sas", "Bahasa Sasak", "NTB (Pulau Lombok)", 2_700_000],
  ["smw", "Bahasa Sumbawa", "NTB (Pulau Sumbawa)", 400_000],
  ["bhp", "Bahasa Bima (Mbojo)", "NTB (Bima-Dompu)", 600_000],
  ["mqy", "Bahasa Manggarai", "NTT (Flores Barat)", 900_000],
  ["nxg", "Bahasa Ngada", "NTT (Flores)", 60_000],
  ["end", "Bahasa Ende", "NTT (Flores)", 110_000],
  ["ljl", "Bahasa Lio", "NTT (Flores)", 150_000],
  ["ski", "Bahasa Sikka", "NTT (Flores)", 180_000],
  ["slp", "Bahasa Lamaholot", "NTT (Flores Timur)", 200_000],
  ["xbr", "Bahasa Kambera", "NTT (Sumba Timur)", 235_000],
  ["wew", "Bahasa Wewewa", "NTT (Sumba Barat)", 100_000],
  ["aoz", "Bahasa Dawan (Uab Meto)", "NTT (Pulau Timor)", 700_000],
  ["tet", "Bahasa Tetun", "NTT (Belu, Malaka)", 450_000],
  ["heg", "Bahasa Helong", "NTT (Kupang)", 14_000],
  ["rote", "Bahasa Rote", "NTT (Pulau Rote)", 30_000],
  ["kvh", "Bahasa Komodo", "NTT (Pulau Komodo)", 1_000],

  // ───────── Kalimantan ─────────
  ["bjn", "Bahasa Banjar", "Kalimantan Selatan", 4_800_000],
  ["vkt", "Bahasa Kutai", "Kalimantan Timur", 300_000],
  ["bve", "Bahasa Melayu Berau", "Kalimantan Timur", 50_000],
  ["pdu", "Bahasa Paser", "Kalimantan Timur", 90_000],
  ["bhv", "Bahasa Bahau", "Kalimantan Timur", 20_000],
  ["iba", "Bahasa Iban", "Kalimantan Barat", 700_000],
  ["knx", "Bahasa Kendayan (Kanayatn)", "Kalimantan Barat", 350_000],
  ["mhy", "Bahasa Ma'anyan", "Kalimantan Tengah & Selatan", 150_000],
  ["bkr", "Bahasa Bakumpai", "Kalimantan Tengah", 100_000],
  ["otd", "Bahasa Ot Danum", "Kalimantan Tengah", 80_000],
  ["xkl", "Bahasa Kenyah", "Kalimantan Utara & Timur", 40_000],
  ["lnd", "Bahasa Lundayeh (Lun Bawang)", "Kalimantan Utara", 30_000],
  ["tid", "Bahasa Tidung", "Kalimantan Utara", 27_000],

  // ───────── Sulawesi ─────────
  ["mak", "Bahasa Makassar", "Sulawesi Selatan", 2_100_000],
  ["sda", "Bahasa Toraja (Sa'dan)", "Sulawesi Selatan", 750_000],
  ["mvp", "Bahasa Duri", "Sulawesi Selatan (Enrekang)", 130_000],
  ["kjc", "Bahasa Konjo", "Sulawesi Selatan", 150_000],
  ["sly", "Bahasa Selayar", "Sulawesi Selatan (Kep. Selayar)", 100_000],
  ["mdr", "Bahasa Mandar", "Sulawesi Barat", 500_000],
  ["grl", "Bahasa Gorontalo", "Gorontalo", 1_000_000],
  ["mog", "Bahasa Mongondow", "Sulawesi Utara", 900_000],
  ["xmm", "Bahasa Melayu Manado", "Sulawesi Utara", 850_000],
  ["tnt", "Bahasa Tontemboan", "Sulawesi Utara (Minahasa)", 150_000],
  ["tom", "Bahasa Tombulu", "Sulawesi Utara (Minahasa)", 60_000],
  ["sxn", "Bahasa Sangir", "Sulawesi Utara (Kep. Sangihe)", 200_000],
  ["tld", "Bahasa Talaud", "Sulawesi Utara (Kep. Talaud)", 80_000],
  ["lew", "Bahasa Kaili", "Sulawesi Tengah", 330_000],
  ["pmf", "Bahasa Pamona", "Sulawesi Tengah", 130_000],
  ["bgz", "Bahasa Banggai", "Sulawesi Tengah", 130_000],
  ["loe", "Bahasa Saluan", "Sulawesi Tengah", 80_000],
  ["bkz", "Bahasa Bungku", "Sulawesi Tengah", 25_000],
  ["mzq", "Bahasa Mori", "Sulawesi Tengah", 30_000],
  ["lbw", "Bahasa Tolaki", "Sulawesi Tenggara", 330_000],
  ["mnb", "Bahasa Muna", "Sulawesi Tenggara (Pulau Muna)", 300_000],
  ["wlo", "Bahasa Wolio (Buton)", "Sulawesi Tenggara (Pulau Buton)", 35_000],
  ["cia", "Bahasa Cia-Cia", "Sulawesi Tenggara (Pulau Buton)", 80_000],
  ["bdl", "Bahasa Bajau (Bajo)", "Pesisir Sulawesi & Nusantara", 150_000],

  // ───────── Maluku ─────────
  ["abs", "Bahasa Melayu Ambon", "Maluku", 250_000],
  ["tft", "Bahasa Ternate", "Maluku Utara (Pulau Ternate)", 50_000],
  ["tvo", "Bahasa Tidore", "Maluku Utara (Pulau Tidore)", 50_000],
  ["tlb", "Bahasa Tobelo", "Maluku Utara (Halmahera)", 30_000],
  ["gbi", "Bahasa Galela", "Maluku Utara (Halmahera)", 80_000],
  ["szn", "Bahasa Sula", "Maluku Utara (Kep. Sula)", 20_000],
  ["mhs", "Bahasa Buru", "Maluku (Pulau Buru)", 45_000],
  ["kei", "Bahasa Kei", "Maluku (Kep. Kei)", 85_000],
  ["jmd", "Bahasa Yamdena", "Maluku (Kep. Tanimbar)", 25_000],
  ["alp", "Bahasa Alune", "Maluku (Pulau Seram)", 17_000],

  // ───────── Papua ─────────
  ["bhw", "Bahasa Biak", "Papua (Biak-Numfor)", 70_000],
  ["dnw", "Bahasa Dani (Lani)", "Papua Pegunungan", 180_000],
  ["yli", "Bahasa Yali", "Papua Pegunungan", 30_000],
  ["ekg", "Bahasa Mee (Ekari)", "Papua Tengah", 100_000],
  ["cns", "Bahasa Asmat", "Papua Selatan", 50_000],
  ["mrz", "Bahasa Marind", "Papua Selatan (Merauke)", 9_000],
  ["kti", "Bahasa Muyu", "Papua (Boven Digoel)", 10_000],
  ["set", "Bahasa Sentani", "Papua (Jayapura)", 30_000],
  ["ayz", "Bahasa Maybrat", "Papua Barat Daya", 25_000],
  ["mxn", "Bahasa Moi", "Papua Barat Daya (Sorong)", 5_000],
  ["mej", "Bahasa Meyah", "Papua Barat (Manokwari)", 15_000],
  ["had", "Bahasa Hatam", "Papua Barat (Manokwari)", 16_000],
  ["wad", "Bahasa Wandamen", "Papua Barat (Teluk Wondama)", 8_000],
  ["khe", "Bahasa Korowai", "Papua Selatan", 3_000],
];

function regionalPrompt(name: string, region: string): string {
  return (
    `Anda adalah NusaLingua, asisten AI berbahasa ${name} dari ${region}. ` +
    `Balas dalam ${name} bila memungkinkan, dan selalu sertakan terjemahan Bahasa Indonesia ` +
    `dalam kurung untuk frasa penting. Hormati konteks budaya dan tingkatan bahasa setempat. ` +
    `Bila tidak yakin akan suatu kata, jujur sampaikan dan tawarkan padanan Bahasa Indonesia.`
  );
}

const regional: SeedLanguage[] = regionalData.map(([code, name, region, speakers]) => ({
  code,
  name,
  region,
  speakers,
  status: "soon",
  flag: code.toUpperCase().slice(0, 4),
  systemPrompt: regionalPrompt(name, region),
}));

const allLanguages: SeedLanguage[] = [...core, ...regional];

async function main() {
  // Guard: pastikan tidak ada kode (PK) duplikat sebelum menulis ke DB.
  const seen = new Set<string>();
  for (const lang of allLanguages) {
    if (seen.has(lang.code)) throw new Error(`Duplicate language code: ${lang.code}`);
    seen.add(lang.code);
  }

  console.log(`🌱 Seeding ${allLanguages.length} languages...`);

  for (const lang of allLanguages) {
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
  }

  console.log(`\n✅ Seed complete — ${allLanguages.length} bahasa (${core.length} inti + ${regional.length} daerah).`);
  console.log("   User account dibuat otomatis saat sign-up via Supabase Auth.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
