import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../lib/store";
import { textToSpeech } from "../lib/api";
import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Play, Pause, Download, Loader2 } from "lucide-react";

const VOICES = [
  { id: "English_Graceful_Lady", name: "Graceful Lady" },
  { id: "English_Insightful_Speaker", name: "Insightful Speaker" },
  { id: "English_radiant_girl", name: "Radiant Girl" },
  { id: "English_Persuasive_Man", name: "Persuasive Man" },
  { id: "moss_audio_6dc281eb-713c-11f0-a447-9613c873494c", name: "Lucky Robot" },
  { id: "Chinese_Mandarin_Lyrical_Voice", name: "Lyrical Voice (CN)" },
  { id: "Chinese_Mandarin_HK_Flight_Attendant", name: "Flight Attendant (HK)" },
];

export default function TTS() {
  const navigate = useNavigate();
  const { apiKey } = useChatStore();
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]?.id ?? "English_Graceful_Lady");
  const [speed, setSpeed] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageChars, setUsageChars] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("pause", () => setIsPlaying(false));
    return () => {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      audio.removeEventListener("pause", () => setIsPlaying(false));
    };
  }, []);

  const handleGenerate = async () => {
    if (!text.trim() || !apiKey) return;
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    try {
      const result = await textToSpeech(apiKey, {
        text: text.slice(0, 10000),
        voice_id: selectedVoice,
        speed,
      });
      if (result.url) {
        setAudioUrl(result.url);
        setUsageChars(result.usage_characters || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate speech");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = audioUrl;
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    try {
      const filePath = await save({
        defaultPath: "speech.mp3",
        filters: [{ name: "Audio", extensions: ["mp3"] }],
      });
      if (!filePath) return;

      await invoke("download_file", { url: audioUrl, path: filePath });
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">API key required</p>
          <button onClick={() => navigate("/settings")} className="btn-primary">
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-safe">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/chat")}
            className="text-sm text-muted-foreground hover:text-foreground min-h-[44px] flex items-center"
          >
            Back
          </button>
          <h1 className="text-xl font-semibold">Text to Speech</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech (max 10,000 characters)"
            className="w-full h-48 resize-none"
            maxLength={10000}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{text.length} / 10,000 characters</span>
            {usageChars && <span>{usageChars} characters used</span>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Voice</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full"
          >
            {VOICES.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Speed: {speed}x</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || isGenerating}
            className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Speech"
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {audioUrl && (
          <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePlay}
                className="btn-primary flex items-center gap-2 min-h-[44px] px-6"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="btn-secondary flex items-center gap-2 min-h-[44px] px-6"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Audio ready - valid for 24 hours
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Quota:</strong> 9,000 characters/day (Plus-Highspeed)</p>
          <p>Tip: Use (laughs), (sighs), (clears throat) etc. for interjections with speech-2.8 models.</p>
        </div>
      </main>
    </div>
  );
}