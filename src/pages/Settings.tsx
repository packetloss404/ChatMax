import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/theme-provider";
import { useChatStore } from "../lib/store";
import { validateApiKey, getModels } from "../lib/api";
import {
  Eye,
  EyeOff,
  Check,
  X,
  RefreshCw,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { formatDate } from "../lib/utils";

const MODEL_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const {
    apiKey,
    setApiKey,
    availableModels,
    setAvailableModels,
    selectedModel,
    setSelectedModel,
    lastModelCheck,
    setLastModelCheck,
    clearAllData,
    customModels,
    setCustomModels,
    videoEnabled,
    setVideoEnabled,
  } = useChatStore();

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newCustomModel, setNewCustomModel] = useState("");

  useEffect(() => {
    if (apiKey) {
      setLocalApiKey(apiKey);
      checkModelCache();
    }
  }, [apiKey]);

  const checkModelCache = async () => {
    if (!apiKey || !lastModelCheck) return;
    const now = Date.now();
    if (now - lastModelCheck > MODEL_CACHE_DURATION) {
      await fetchModels();
    }
  };

  const fetchModels = async () => {
    if (!apiKey) return;
    setIsModelsLoading(true);
    try {
      const models = await getModels(apiKey);
      setAvailableModels(models);
      setLastModelCheck(Date.now());
    } catch (error) {
      console.error("Failed to fetch models:", error);
    } finally {
      setIsModelsLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    setConnectionStatus("checking");
    const isValid = await validateApiKey(localApiKey);
    if (isValid) {
      setApiKey(localApiKey);
      setConnectionStatus("success");
      await fetchModels();
    } else {
      setConnectionStatus("error");
    }
  };

  const handleClearData = () => {
    clearAllData();
    setLocalApiKey("");
    setShowClearConfirm(false);
    navigate("/");
  };

  const handleAddCustomModel = () => {
    if (newCustomModel.trim()) {
      const modelId = newCustomModel.trim();
      if (!customModels.includes(modelId)) {
        setCustomModels([...customModels, modelId]);
      }
      setNewCustomModel("");
    }
  };

  const handleRemoveCustomModel = (modelId: string) => {
    setCustomModels(customModels.filter((m) => m !== modelId));
  };

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
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        <section>
          <h2 className="text-lg font-medium mb-4">API Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Enter your MiniMax API key"
                    className="w-full pr-10"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!localApiKey || connectionStatus === "checking"}
                  className="btn-primary whitespace-nowrap min-h-[44px]"
                >
                  {connectionStatus === "checking" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : connectionStatus === "success" ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
              {connectionStatus === "error" && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Invalid API key
                </p>
              )}
              {connectionStatus === "success" && (
                <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Connected successfully
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-4">Model</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full"
                disabled={availableModels.length === 0 && customModels.length === 0}
              >
                {availableModels.length === 0 && customModels.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  <>
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.id}
                      </option>
                    ))}
                    {customModels.map((modelId) => (
                      <option key={modelId} value={modelId}>
                        {modelId} (custom)
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={fetchModels}
                disabled={!apiKey || isModelsLoading}
                className="btn-secondary flex items-center justify-center gap-2 min-h-[44px]"
              >
                <RefreshCw className={`w-4 h-4 ${isModelsLoading ? "animate-spin" : ""}`} />
                Check for Updates
              </button>
              {lastModelCheck && (
                <span className="text-sm text-muted-foreground">
                  Last checked: {formatDate(lastModelCheck)}
                </span>
              )}
            </div>
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium mb-2">Add Custom Model</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomModel}
                  onChange={(e) => setNewCustomModel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomModel()}
                  placeholder="Enter model ID (e.g., MiniMax-NewModel)"
                  className="flex-1"
                />
                <button
                  onClick={handleAddCustomModel}
                  disabled={!newCustomModel.trim()}
                  className="btn-secondary flex items-center justify-center gap-2 min-h-[44px] px-4"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
            {customModels.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Custom Models</label>
                <div className="flex flex-wrap gap-2">
                  {customModels.map((modelId) => (
                    <span
                      key={modelId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                    >
                      {modelId}
                      <button
                        onClick={() => handleRemoveCustomModel(modelId)}
                        className="hover:text-destructive min-w-[20px] min-h-[20px] flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-4">Token Plan Quotas</h2>
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">Plus-Highspeed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">M2.7-highspeed</span>
              <span>4,500 requests / 5hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speech 2.8</span>
              <span>9,000 characters / day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">image-01</span>
              <span>100 images / day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Music-2.6</span>
              <span>100 songs / day (≤5min each)</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Quotas reset automatically. M2.7 uses a rolling 5-hour window.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-4">Appearance</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "light" as const, label: "Light", icon: Sun },
                { value: "dark" as const, label: "Dark", icon: Moon },
                { value: "system" as const, label: "System", icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border transition-colors min-h-[60px] ${
                    theme === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-4">Experimental Features</h2>
          <div>
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border hover:bg-accent transition-colors">
              <div>
                <span className="text-sm font-medium">Video Generation</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate videos using MiniMax Hailuo models (async, takes 4-9 minutes)
                </p>
              </div>
              <input
                type="checkbox"
                checked={videoEnabled}
                onChange={(e) => setVideoEnabled(e.target.checked)}
                className="w-4 h-4 ml-4"
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-4">Data</h2>
          <div>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="btn-secondary flex items-center gap-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            ) : (
              <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                <p className="text-sm mb-4">
                  This will delete all conversations, settings, and your API key. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearData}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
