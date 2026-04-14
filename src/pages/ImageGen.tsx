import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../lib/store";
import { generateImage } from "../lib/api";
import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Image, Loader2, Download, X } from "lucide-react";

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 (1024x1024)" },
  { id: "16:9", label: "16:9 (1280x720)" },
  { id: "4:3", label: "4:3 (1152x864)" },
  { id: "3:2", label: "3:2 (1248x832)" },
  { id: "2:3", label: "2:3 (832x1248)" },
  { id: "3:4", label: "3:4 (864x1152)" },
  { id: "9:16", label: "9:16 (720x1280)" },
  { id: "21:9", label: "21:9 (1344x576)" },
];

export default function ImageGen() {
  const navigate = useNavigate();
  const { apiKey } = useChatStore();
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [count, setCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ success?: number; failed?: number } | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || !apiKey) return;
    setIsGenerating(true);
    setError(null);
    setImages([]);
    setStats(null);
    try {
      const result = await generateImage(apiKey, {
        prompt,
        aspect_ratio: aspectRatio,
        n: count,
        response_format: "url",
      });
      if (result.image_urls && result.image_urls.length > 0) {
        setImages(result.image_urls);
        setStats({
          success: result.success_count,
          failed: result.failed_count,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const filePath = await save({
        defaultPath: `image-${index + 1}.png`,
        filters: [{ name: "Image", extensions: ["png"] }],
      });
      if (!filePath) return;
      await invoke("download_file", { url, path: filePath });
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
          <h1 className="text-xl font-semibold">Image Generation</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full h-32 resize-none"
            maxLength={1500}
          />
          <p className="text-xs text-muted-foreground mt-1">{prompt.length} / 1500 characters</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full"
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.id} value={ratio.id}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Count (1-9)</label>
            <input
              type="number"
              min={1}
              max={9}
              value={count}
              onChange={(e) => setCount(Math.min(9, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image className="w-4 h-4" />
              Generate Image
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {stats?.success || 0} generated, {stats?.failed || 0} blocked
              </span>
            </div>
            <div className={`grid gap-4 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {images.map((url, index) => (
                <div key={index} className="space-y-2">
                  <img
                    src={url}
                    alt={`Generated image ${index + 1}`}
                    className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxUrl(url)}
                  />
                  <button
                    onClick={() => handleDownload(url, index)}
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm min-h-[40px]"
                  >
                    <Download className="w-4 h-4" />
                    Save Image
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Click an image to view full size. Images expire in 24 hours.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Quota:</strong> 100 images/day (Plus-Highspeed)</p>
          <p>Tip: Be specific about style, lighting, composition for better results.</p>
        </div>
      </main>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
