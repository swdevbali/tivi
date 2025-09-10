# Tivi - Remote Desktop Control System

A TeamViewer-like application for remote desktop control, built with modern web technologies and native macOS support.

## Features

- 🖥️ **Remote Desktop Control**: Control remote computers with mouse and keyboard
- 🔒 **Secure Connections**: WebRTC encrypted peer-to-peer connections
- 📱 **Multi-Device Management**: One account can manage multiple devices
- 🎬 **Real-time Screen Sharing**: Low-latency screen streaming
- 🔐 **Permission-based Access**: Explicit consent required for remote control
- 🍎 **Native macOS Support**: Optimized for macOS with native Swift agent

## Architecture

- **Control Station**: React + TypeScript web app for controlling remote devices
- **Device Agent**: Native Swift application for macOS
- **Signaling Server**: Node.js + Socket.io for WebRTC connection establishment
- **Communication**: WebRTC for peer-to-peer video streaming and control

## Project Structure

```
tivi/
├── packages/
│   ├── agent/           # macOS device agent (Swift)
│   ├── control/         # Control station (React)
│   ├── server/          # Signaling server (Node.js)
│   └── shared/          # Shared TypeScript types
└── scripts/             # Build and deployment scripts
```

## Prerequisites

- Node.js 18+ and pnpm
- macOS 13+ (for the agent)
- Xcode 14+ (for building the agent)

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build shared types:**
   ```bash
   pnpm run build:shared
   ```

3. **Start the signaling server:**
   ```bash
   pnpm run dev:server
   ```

4. **Start the control station:**
   ```bash
   pnpm run dev:control
   ```

5. **Build and run the macOS agent:**
   ```bash
   cd packages/agent
   swift build
   swift run TiviAgent
   ```

## macOS Permissions

The agent requires these permissions to function:
- **Accessibility**: For mouse and keyboard control
- **Screen Recording**: For screen capture

Grant these permissions when prompted or in System Preferences > Privacy & Security.

## Development

### Available Commands

```bash
pnpm run dev              # Start all services
pnpm run dev:server       # Start signaling server only
pnpm run dev:control      # Start control station only
pnpm run build            # Build all packages
pnpm run test             # Run tests
```

### Tech Stack

- **Frontend**: React, TypeScript, Vite, Zustand
- **Backend**: Node.js, Express, Socket.io
- **Agent**: Swift, AVFoundation, CoreGraphics
- **Communication**: WebRTC, Socket.io

## Security

- All connections use WebRTC encryption (DTLS-SRTP)
- JWT-based authentication
- Explicit consent required for remote control
- Session tokens expire after 24 hours

## License

MIT