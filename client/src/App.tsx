import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Voice from "./pages/Voice";
import Explorer from "./pages/Explorer";
import Studio from "./pages/Studio";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/explorer" element={<Explorer />} />

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
    </Routes>
  );
}
