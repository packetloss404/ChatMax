import type { Model } from "./types";

const API_BASE = "https://api.minimax.io/v1";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getModels(_apiKey: string): Promise<Model[]> {
  return [
    { id: "MiniMax-M2.7", name: "MiniMax-M2.7" },
    { id: "MiniMax-M2.7-highspeed", name: "MiniMax-M2.7-highspeed" },
    { id: "MiniMax-M2.5", name: "MiniMax-M2.5" },
    { id: "MiniMax-M2.5-highspeed", name: "MiniMax-M2.5-highspeed" },
    { id: "MiniMax-M2.1", name: "MiniMax-M2.1" },
    { id: "MiniMax-M2.1-highspeed", name: "MiniMax-M2.1-highspeed" },
    { id: "MiniMax-M2", name: "MiniMax-M2" },
  ];
}

export async function sendMessage(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to send message");
  }
  const data = await res.json();
  return data.choices[0]?.message?.content || "";
}

export async function sendMessageStream(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Failed to send message");
    }
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    let inThinkBlock = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        let data = line;
        if (line.startsWith("data: ")) {
          data = line.slice(6);
        }
        if (data === "[DONE]") {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            // Filter out <think>...</think> blocks from reasoning models
            let filtered = content;
            if (!inThinkBlock && filtered.includes("<think>")) {
              inThinkBlock = true;
              filtered = filtered.replace(/<think>[\s\S]*/, "");
            }
            if (inThinkBlock) {
              if (filtered.includes("</think>")) {
                inThinkBlock = false;
                filtered = filtered.replace(/[\s\S]*<\/think>/, "");
              } else {
                filtered = "";
              }
            }
            if (filtered) {
              onChunk(filtered);
            }
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error("Unknown error"));
  }
}

export interface TTSOptions {
  model?: string;
  text: string;
  voice_id?: string;
  speed?: number;
  output_format?: "url" | "hex";
}

export interface TTSResult {
  audio?: string;
  url?: string;
  status: number;
  usage_characters?: number;
}

export async function textToSpeech(
  apiKey: string,
  options: TTSOptions
): Promise<TTSResult> {
  const res = await fetch(`${API_BASE}/t2a_v2`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || "speech-2.8-hd",
      text: options.text,
      stream: false,
      output_format: options.output_format || "url",
      voice_setting: {
        voice_id: options.voice_id || "English_Graceful_Lady",
        speed: options.speed || 1,
      },
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to generate speech");
  }
  const data = await res.json();
  const audioData = data.data?.audio;
  const format = options.output_format || "url";
  let url: string | undefined;
  if (format === "url" && audioData) {
    // API returns a direct URL to the audio file
    url = audioData;
  } else if (format === "hex" && audioData) {
    // Convert hex string to base64 data URL
    const bytes = new Uint8Array(audioData.length / 2);
    for (let i = 0; i < audioData.length; i += 2) {
      bytes[i / 2] = parseInt(audioData.substr(i, 2), 16);
    }
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    url = `data:audio/mp3;base64,${btoa(binary)}`;
  }
  return {
    audio: audioData,
    url,
    status: data.data?.status || 0,
    usage_characters: data.extra_info?.usage_characters,
  };
}

export interface ImageOptions {
  model?: string;
  prompt: string;
  aspect_ratio?: string;
  n?: number;
  response_format?: "url" | "base64";
}

export interface ImageResult {
  image_urls?: string[];
  image_base64?: string[];
  success_count?: number;
  failed_count?: number;
}

export async function generateImage(
  apiKey: string,
  options: ImageOptions
): Promise<ImageResult> {
  const res = await fetch(`${API_BASE}/image_generation`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || "image-01",
      prompt: options.prompt,
      aspect_ratio: options.aspect_ratio || "1:1",
      n: options.n || 1,
      response_format: options.response_format || "url",
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to generate image");
  }
  const data = await res.json();
  return {
    image_urls: data.data?.image_urls,
    image_base64: data.data?.image_base64,
    success_count: data.metadata?.success_count,
    failed_count: data.metadata?.failed_count,
  };
}

export interface MusicOptions {
  model?: string;
  prompt: string;
  lyrics?: string;
  is_instrumental?: boolean;
  output_format?: "url" | "hex";
}

export interface MusicResult {
  audio?: string;
  url?: string;
  status: number;
  music_duration?: number;
}

export async function generateMusic(
  apiKey: string,
  options: MusicOptions
): Promise<MusicResult> {
  const res = await fetch(`${API_BASE}/music_generation`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || "music-2.6",
      prompt: options.prompt,
      lyrics: options.lyrics,
      is_instrumental: options.is_instrumental || false,
      output_format: options.output_format || "url",
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to generate music");
  }
  const data = await res.json();
  return {
    audio: data.data?.audio,
    url: data.data?.audio || undefined,
    status: data.data?.status || 0,
    music_duration: data.extra_info?.music_duration,
  };
}

// --- Video Generation (async task-based) ---

export interface VideoSubmitOptions {
  model?: string;
  prompt: string;
  prompt_optimizer?: boolean;
  duration?: 6 | 10;
  resolution?: "720P" | "768P" | "1080P";
}

export interface VideoSubmitResult {
  task_id: string;
  base_resp: { status_code: number; status_msg: string };
}

export async function submitVideoGeneration(
  apiKey: string,
  options: VideoSubmitOptions
): Promise<VideoSubmitResult> {
  const res = await fetch(`${API_BASE}/video_generation`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || "MiniMax-Hailuo-2.3",
      prompt: options.prompt,
      prompt_optimizer: options.prompt_optimizer ?? true,
      duration: options.duration || 6,
      resolution: options.resolution || "1080P",
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to submit video generation");
  }
  const data = await res.json();
  if (data.base_resp?.status_code !== 0) {
    throw new Error(data.base_resp?.status_msg || "Video generation failed");
  }
  return data;
}

export interface VideoStatusResult {
  task_id: string;
  status: "Preparing" | "Queueing" | "Processing" | "Success" | "Fail";
  file_id?: string;
  video_width?: number;
  video_height?: number;
  base_resp: { status_code: number; status_msg: string };
}

export async function queryVideoStatus(
  apiKey: string,
  taskId: string
): Promise<VideoStatusResult> {
  const res = await fetch(`${API_BASE}/query/video_generation?task_id=${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to query video status");
  }
  const data = await res.json();
  return data;
}

export interface VideoFileResult {
  file: {
    file_id: string;
    download_url: string;
  };
  base_resp: { status_code: number; status_msg: string };
}

export async function retrieveVideoFile(
  apiKey: string,
  fileId: string
): Promise<VideoFileResult> {
  const res = await fetch(`${API_BASE}/files/retrieve?file_id=${fileId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to retrieve video file");
  }
  const data = await res.json();
  if (data.base_resp?.status_code !== 0) {
    throw new Error(data.base_resp?.status_msg || "Failed to retrieve video");
  }
  return data;
}
