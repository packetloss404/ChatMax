# ChatMax

A desktop client for the [MiniMax API](https://www.minimax.io/). Chat, generate images, create music, convert text to speech, and generate video — all from one app.

Built with [Tauri v2](https://tauri.app/) and React.

## Features

- **Chat** — Streaming conversations with MiniMax M2.7 models, markdown rendering, code highlighting
- **Text to Speech** — Multiple voices, adjustable speed, MP3 download
- **Image Generation** — Multiple aspect ratios, batch generation (1-9 images)
- **Music Generation** — Instrumental or with lyrics, structure tags support
- **Video Generation** — Text-to-video with camera controls, multiple resolutions (optional, enable in settings)
- **Theming** — Light, dark, and system modes
- **Persistence** — API key, model selection, conversations, and settings saved across restarts
- **System Tray** — Minimize to tray, global shortcut (Ctrl+Shift+Space) to toggle window

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri)
- A [MiniMax API key](https://www.minimax.io/)

## Getting Started

```bash
# Install dependencies
npm install

# Run in development
npm run tauri dev

# Build for production
npm run tauri build
```

On first launch, go to Settings and enter your MiniMax API key.

## Downloads

Pre-built Windows installers are available in the `src-tauri/target/release/bundle/` directory after building:

- `nsis/ChatMax_0.1.0_x64-setup.exe` — NSIS installer
- `msi/ChatMax_0.1.0_x64_en-US.msi` — MSI installer

## Tech Stack

- **Desktop:** Tauri v2 (Rust)
- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Framer Motion
- **State:** Zustand (persisted to localStorage)

## License

MIT
