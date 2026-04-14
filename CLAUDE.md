# ChatMax

Desktop app for the MiniMax API. Built with Tauri v2 + React 19 + TypeScript + Vite.

## Project Structure

```
/                        # Root (Vite/React frontend)
├── src/                 # React source
│   ├── components/      # UI components
│   │   ├── chat/        # Chat UI (sidebar, message list, input)
│   │   ├── logo.tsx     # SVG logo component
│   │   └── theme-provider.tsx
│   ├── pages/           # Route pages (Chat, Home, Settings, TTS, ImageGen, MusicGen, VideoGen)
│   ├── lib/             # Shared logic
│   │   ├── api.ts       # MiniMax API client (chat, TTS, image, music, video)
│   │   ├── store.ts     # Zustand global state (persisted via localStorage)
│   │   ├── types.ts     # TypeScript interfaces
│   │   └── utils.ts     # Utilities (cn, generateId)
│   ├── App.tsx          # Router setup
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind v4 + theme variables
├── src-tauri/           # Tauri Rust backend
│   ├── src/main.rs      # App setup, tray menu, global shortcuts, download_file command
│   ├── src/lib.rs       # Lib target (mirrors main.rs)
│   ├── tauri.conf.json  # Window/bundle config
│   ├── capabilities/    # Tauri v2 permissions (dialog, fs, http, store, shortcuts)
│   └── Cargo.toml       # Rust dependencies
├── public/              # Static assets
│   └── favicon.svg      # App favicon
├── index.html           # HTML shell
├── vite.config.ts       # Vite config (port 1420)
├── tsconfig.json        # TypeScript (ES2020, strict)
├── postcss.config.js    # Tailwind v4 + autoprefixer
└── package.json         # npm config
```

## Tech Stack

- **Desktop:** Tauri v2 (Rust) with tray icon + global shortcut (Ctrl+Shift+Space)
- **Frontend:** React 19, TypeScript, Vite 6
- **Styling:** Tailwind CSS v4, CSS custom properties for theming, Framer Motion
- **State:** Zustand with persist middleware (useChatStore)
- **Routing:** React Router v7
- **Markdown:** react-markdown + remark-gfm + rehype-highlight + rehype-raw
- **Icons:** Lucide React
- **Theme:** next-themes (light/dark/system, class-based)

## Commands

```bash
npm run dev          # Vite dev server (port 1420)
npm run build        # tsc + vite build -> dist/
npm run preview      # Preview production build
npm run tauri dev    # Run Tauri desktop app (starts vite dev automatically)
npm run tauri build  # Build desktop installer (exe/msi/nsis)
```

## API

All API calls go through `src/lib/api.ts` targeting `https://api.minimax.io/v1`.

- **Chat:** streaming completions with `<think>` block filtering
- **TTS:** text-to-speech via speech-2.8-hd, returns audio URL
- **Image:** image-01 model, returns image URLs
- **Music:** music-2.6 model, returns audio URL
- **Video:** async task-based (submit → poll → retrieve file URL), Hailuo models

## Key Patterns

- Pages in `src/pages/`, components in `src/components/`
- Global state via `useChatStore` hook (Zustand) in `src/lib/store.ts`, persisted to localStorage
- File downloads use Rust `download_file` command (reqwest + tokio::fs) with Tauri dialog for Save As
- Audio playback uses `useRef<HTMLAudioElement>` to persist across renders
- Video generation is gated behind a settings toggle (disabled by default)
- Theme toggling via CSS class on document root + CSS variables in `index.css`
- Tauri window: 1000x800 default, min 400x500, centered
