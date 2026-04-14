import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../lib/store";
import { submitVideoGeneration, queryVideoStatus, retrieveVideoFile } from "../lib/api";
import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Video, Loader2, Download, X } from "lucide-react";

const VIDEO_MODELS = [
  { id: "MiniMax-Hailuo-2.3", label: "Hailuo 2.3 (Latest)" },
  { id: "MiniMax-Hailuo-02", label: "Hailuo 02" },
  { id: "T2V-01-Director", label: "T2V Director" },
  { id: "T2V-01", label: "T2V 01" },
];

const RESOLUTIONS = [
  { id: "1080P", label: "1080P" },
  { id: "720P", label: "720P" },
  { id: "768P", label: "768P" },
];

const CAMERA_CONTROLS = [
  "[Zoom in]",
  "[Zoom out]",
  "[Pan left]",
  "[Pan right]",
  "[Tilt up]",
  "[Tilt down]",
  "[Tracking shot]",
  "[Static shot]",
];

export default function VideoGen() {
  const navigate = useNavigate();
  const { apiKey, videoEnabled } = useChatStore();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("MiniMax-Hailuo-2.3");
  const [duration, setDuration] = useState<6 | 10>(6);
  const [resolution, setResolution] = useState<"720P" | "768P" | "1080P">("1080P");
  const [promptOptimizer, setPromptOptimizer] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !apiKey) return;
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStatus("Submitting...");
    setElapsed(0);
    cleanup();

    try {
      const result = await submitVideoGeneration(apiKey, {
        model,
        prompt: prompt.slice(0, 2000),
        prompt_optimizer: promptOptimizer,
        duration,
        resolution,
      });

      const taskId = result.task_id;
      setStatus("Preparing");

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      pollRef.current = setInterval(async () => {
        try {
          const statusResult = await queryVideoStatus(apiKey, taskId);
          setStatus(statusResult.status);

          if (statusResult.status === "Success" && statusResult.file_id) {
            cleanup();
            try {
              const fileResult = await retrieveVideoFile(apiKey, statusResult.file_id);
              setVideoUrl(fileResult.file.download_url);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to retrieve video");
            }
            setIsGenerating(false);
          } else if (statusResult.status === "Fail") {
            cleanup();
            setError(statusResult.base_resp?.status_msg || "Video generation failed");
            setIsGenerating(false);
          }
        } catch (err) {
          cleanup();
          setError(err instanceof Error ? err.message : "Failed to check status");
          setIsGenerating(false);
        }
      }, 10000);
    } catch (err) {
      cleanup();
      setError(err instanceof Error ? err.message : "Failed to submit video generation");
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    cleanup();
    setIsGenerating(false);
    setStatus(null);
    setElapsed(0);
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    try {
      const filePath = await save({
        defaultPath: "video.mp4",
        filters: [{ name: "Video", extensions: ["mp4"] }],
      });
      if (!filePath) return;
      await invoke("download_file", { url: videoUrl, path: filePath });
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const appendToPrompt = (text: string) => {
    setPrompt((prev) => (prev ? `${prev} ${text}` : text));
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

  if (!videoEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Video generation is disabled</p>
          <button onClick={() => navigate("/settings")} className="btn-primary">
            Enable in Settings
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
          <h1 className="text-xl font-semibold">Video Generation</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video you want to generate..."
            className="w-full h-32 resize-none"
            maxLength={2000}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground mt-1">{prompt.length} / 2000 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Camera Controls</label>
          <div className="flex flex-wrap gap-2">
            {CAMERA_CONTROLS.map((ctrl) => (
              <button
                key={ctrl}
                onClick={() => appendToPrompt(ctrl)}
                disabled={isGenerating}
                className="px-2.5 py-1 text-xs bg-secondary rounded-full border border-border hover:bg-accent transition-colors disabled:opacity-50"
              >
                {ctrl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full"
              disabled={isGenerating}
            >
              {VIDEO_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Resolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as "720P" | "768P" | "1080P")}
              className="w-full"
              disabled={isGenerating}
            >
              {RESOLUTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) as 6 | 10)}
              className="w-full"
              disabled={isGenerating}
            >
              <option value={6}>6 seconds</option>
              <option value={10}>10 seconds</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={promptOptimizer}
                onChange={(e) => setPromptOptimizer(e.target.checked)}
                className="w-4 h-4"
                disabled={isGenerating}
              />
              <span className="text-sm font-medium">Optimize prompt</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                Generate Video
              </>
            )}
          </button>
          {isGenerating && (
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center gap-2 min-h-[44px] px-4"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>

        {isGenerating && status && (
          <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium">Status: {status}</p>
                <p className="text-xs text-muted-foreground">
                  Elapsed: {formatElapsed(elapsed)} — typically takes 4-9 minutes
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {videoUrl && (
          <div className="space-y-4">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg bg-black"
            />
            <button
              onClick={handleDownload}
              className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              Save Video
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Video URL expires in 9 hours
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Tip: Use camera control chips to add movement. Be specific about scene, style, and motion.</p>
        </div>
      </main>
    </div>
  );
}
