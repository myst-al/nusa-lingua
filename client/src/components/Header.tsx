import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

interface HeaderProps {
  showCta?: boolean;
  rightSlot?: React.ReactNode;
}

export function Header({ showCta = true, rightSlot }: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-extrabold">
            N
          </div>
          <span className="font-extrabold text-base">
            Nusa<span className="text-primary">Lingua</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {rightSlot}
          {showCta && !user && (
            <>
              <button className="btn-ghost btn-sm" onClick={() => navigate("/explorer")}>
                Bahasa
              </button>
              <button className="btn-ghost btn-sm" onClick={() => navigate("/pricing")}>
                Harga
              </button>
              <button className="btn-ghost btn-sm" onClick={() => navigate("/login")}>
                Masuk
              </button>
              <button className="btn-primary btn-sm" onClick={() => navigate("/login")}>
                Daftar Gratis
              </button>
            </>
          )}
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center"
              >
                {initial}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-line rounded-xl shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-line">
                    <div className="text-xs text-ink-mute">Login sebagai</div>
                    <div className="text-sm font-semibold truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/chat");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50"
                  >
                    💬 Chat
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/voice");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50"
                  >
                    🎤 Voice
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/translate");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50"
                  >
                    🔤 Terjemah
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/studio");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50"
                  >
                    ▦ Studio
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/pricing");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50"
                  >
                    💎 Langganan
                  </button>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                      navigate("/");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 border-t border-line"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
