import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import TTS from "./pages/TTS";
import ImageGen from "./pages/ImageGen";
import MusicGen from "./pages/MusicGen";
import VideoGen from "./pages/VideoGen";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
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
