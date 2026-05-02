import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import TTS from "./pages/TTS";
import ImageGen from "./pages/ImageGen";
import MusicGen from "./pages/MusicGen";
import VideoGen from "./pages/VideoGen";
import { useChatStore } from "./lib/store";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tts" element={<TTS />} />
          <Route path="/image" element={<ImageGen />} />
          <Route path="/music" element={<MusicGen />} />
          <Route path="/video" element={<VideoGen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function RootRoute() {
  const apiKey = useChatStore((state) => state.apiKey);
  const [hasHydrated, setHasHydrated] = useState(() =>
    useChatStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsubscribe = useChatStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (useChatStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsubscribe;
  }, []);

  if (!hasHydrated) {
    return null;
  }

  return apiKey.trim() ? <Navigate to="/chat" replace /> : <Home />;
}
