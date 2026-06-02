import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { useEffect } from "react";

type Mode = "signin" | "signup";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    "/chat";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Kalau sudah login, redirect
  useEffect(() => {
    if (!loading && user) navigate(redirectTo, { replace: true });
  }, [user, loading, navigate, redirectTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(redirectTo, { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setInfo(
            "Pendaftaran berhasil! Cek email kamu untuk verifikasi akun, lalu login."
          );
          setMode("signin");
        } else if (data.session) {
          navigate(redirectTo, { replace: true });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login gagal";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* LEFT: Brand panel */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-12 flex flex-col justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-extrabold">
            N
          </div>
          <span className="font-extrabold">NusaLingua</span>
        </Link>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Selamat datang ke<br />NusaLingua.
          </h2>
          <p className="opacity-90 max-w-sm">
            Lanjutkan percakapan dengan AI berbahasa daerah favoritmu — Jawa,
            Sunda, Batak, dan banyak lagi.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 max-w-md">
          <p className="text-sm mb-2">
            "Pertama kali AI menjawab dalam bahasa Jawa krama dengan benar. Ini
            bukan terjemahan — ini paham konteksnya."
          </p>
          <small className="opacity-75 text-xs">— Pengguna Beta, Yogyakarta</small>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="bg-white p-12 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h3 className="text-2xl font-extrabold mb-1">
            {mode === "signin" ? "Masuk ke akun" : "Buat akun baru"}
          </h3>
          <p className="text-ink-soft text-sm mb-6">
            {mode === "signin" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-semibold"
            >
              {mode === "signin" ? "Daftar gratis" : "Masuk di sini"}
            </button>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              {info}
            </div>
          )}

          <label className="block text-xs font-semibold text-ink-soft mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 border border-line rounded-xl text-sm mb-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary-100"
            placeholder="anda@email.com"
          />

          <label className="block text-xs font-semibold text-ink-soft mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3.5 py-2.5 border border-line rounded-xl text-sm mb-5 outline-none focus:border-primary focus:ring-2 focus:ring-primary-100"
            placeholder="Minimal 6 karakter"
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full btn-primary btn-lg mb-3 disabled:opacity-50"
          >
            {busy
              ? "Memproses…"
              : mode === "signin"
              ? "Masuk ke Dashboard"
              : "Daftar Akun"}
          </button>

          <div className="text-center my-4 text-xs text-ink-mute relative">
            <span className="bg-white px-3 relative z-10">atau lanjut dengan</span>
            <span className="absolute left-0 top-1/2 w-full h-px bg-line -z-0" />
          </div>

          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={busy}
            className="w-full px-3.5 py-2.5 border border-line rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mb-2 hover:border-primary"
          >
            🔵 Lanjut dengan Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={busy}
            className="w-full px-3.5 py-2.5 border border-line rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:border-primary"
          >
            🐙 Lanjut dengan GitHub
          </button>

          <p className="text-center text-xs text-ink-mute mt-6">
            Dengan mendaftar, kamu setuju dengan <a href="#" className="text-primary">Syarat &amp; Ketentuan</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
