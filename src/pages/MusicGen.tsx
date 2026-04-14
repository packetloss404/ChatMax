import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../lib/store";
import { generateMusic } from "../lib/api";
import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Music, Loader2, Play, Pause, Download } from "lucide-react";

const LYRICS_STRUCTURE = "[Intro] [Verse] [Pre Chorus] [Chorus] [Interlude] [Bridge] [Outro]";

export default function MusicGen() {
  const navigate = useNavigate();
  const { apiKey } = useChatStore();
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

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
    if (!prompt.trim() || !apiKey) return;
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    try {
      const result = await generateMusic(apiKey, {
        prompt,
        lyrics: isInstrumental ? undefined : lyrics,
        is_instrumental: isInstrumental,
        output_format: "url",
      });
      if (result.url) {
        setAudioUrl(result.url);
        setDuration(result.music_duration || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate music");
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
        defaultPath: "music.mp3",
        filters: [{ name: "Audio", extensions: ["mp3"] }],
      });
      if (!filePath) return;
      await invoke("download_file", { url: audioUrl, path: filePath });
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          <h1 className="text-xl font-semibold">Music Generation</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Music Description / Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the music style, mood, and scenario... (e.g., 'Pop, melancholic, perfect for a rainy night')"
            className="w-full h-24 resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground mt-1">{prompt.length} / 2000 characters</p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isInstrumental}
              onChange={(e) => setIsInstrumental(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Instrumental only (no vocals)</span>
          </label>
        </div>

        {!isInstrumental && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Lyrics (optional)
              <span className="text-muted-foreground font-normal ml-2">
                Leave empty for auto-generated
              </span>
            </label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={`Add lyrics separated by newlines...\n\nStructure tags: ${LYRICS_STRUCTURE}`}
              className="w-full h-40 resize-none font-mono text-sm"
              maxLength={3500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {lyrics.length} / 3500 characters
            </p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating... (may take up to 2 minutes)
            </>
          ) : (
            <>
              <Music className="w-4 h-4" />
              Generate Music
            </>
          )}
        </button>

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
            {duration && (
              <p className="text-center text-sm text-muted-foreground">
                Duration: {formatDuration(duration)}
              </p>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Audio expires in 24 hours
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Quota:</strong> 100 songs/day (≤5min each) (Plus-Highspeed)</p>
          <p><strong>Lyrics structure:</strong> {LYRICS_STRUCTURE}</p>
        </div>
      </main>
    </div>
  );
}
