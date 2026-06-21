import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
// Landing tetap eager — first paint halaman utama tanpa request tambahan.
import Landing from "./pages/Landing";

// Route lain di-lazy-load (code splitting) supaya bundle awal kecil.
const Login = lazy(() => import("./pages/Login"));
const Chat = lazy(() => import("./pages/Chat"));
const Voice = lazy(() => import("./pages/Voice"));
const Explorer = lazy(() => import("./pages/Explorer"));
const Studio = lazy(() => import("./pages/Studio"));
const Translate = lazy(() => import("./pages/Translate"));
const Pricing = lazy(() => import("./pages/Pricing"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-ink-mute text-sm">
      Memuat…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/explorer" element={<Explorer />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Protected */}
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <Chat />
          </RequireAuth>
        }
      />
      <Route
        path="/chat/:conversationId"
        element={
          <RequireAuth>
            <Chat />
          </RequireAuth>
        }
      />
      <Route
        path="/voice"
        element={
          <RequireAuth>
            <Voice />
          </RequireAuth>
        }
      />
      <Route
        path="/studio"
        element={
          <RequireAuth>
            <Studio />
          </RequireAuth>
        }
      />
      <Route
        path="/studio/:botId"
        element={
          <RequireAuth>
            <Studio />
          </RequireAuth>
        }
      />
      <Route
        path="/translate"
        element={
          <RequireAuth>
            <Translate />
          </RequireAuth>
        }
      />
      </Routes>
    </Suspense>
  );
}
