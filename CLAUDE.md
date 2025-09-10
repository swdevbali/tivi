# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Tivi - Remote Desktop Control System

A TeamViewer-like application where ONE ACCOUNT manages SEVERAL DEVICES, enabling remote control via mouse and keyboard. Initial focus: macOS implementation.

## Technical Architecture

### Core Components

#### 1. Device Agent (macOS Native)
- **Technology**: Swift/Objective-C with system-level APIs
- **Key APIs**:
  - `CGEventTap` for capturing and injecting mouse/keyboard events
  - `CGWindowListCopyWindowInfo` for screen capture
  - `AVFoundation` for efficient screen recording
  - `IOKit` for system-level device access
- **Security**: Requires Accessibility and Screen Recording permissions

#### 2. Control Station (Web/Electron)
- **Frontend**: React + TypeScript
- **Desktop Wrapper**: Electron for native features
- **Real-time Communication**: WebRTC for low-latency streaming
- **State Management**: Zustand or Redux Toolkit

#### 3. Signaling Server
- **Technology**: Node.js + Express + Socket.io
- **Database**: PostgreSQL for account/device management
- **Authentication**: JWT with refresh tokens
- **Purpose**: WebRTC signaling, device discovery, session management

#### 4. TURN/STUN Server
- **Technology**: coturn or custom implementation
- **Purpose**: NAT traversal for peer-to-peer connections

### Data Flow Architecture

```
[Control Station] <--WebRTC--> [Device Agent]
        |                            |
        |________Signaling__________|
                    |
            [Signaling Server]
                    |
                [Database]
```

### Key Technical Decisions

1. **WebRTC over TCP/UDP**: Lower latency, built-in encryption, NAT traversal
2. **H.264/H.265 Encoding**: Hardware acceleration on macOS via VideoToolbox
3. **Protocol Buffers**: Efficient binary serialization for control messages
4. **mDNS/Bonjour**: Local network device discovery

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
1. Set up monorepo structure (pnpm workspaces)
2. Create device agent skeleton (Swift/macOS)
3. Implement basic screen capture API
4. Set up signaling server with Socket.io
5. Create control station React app

### Phase 2: Core Functionality (Week 3-4)
1. Implement WebRTC connection establishment
2. Add screen streaming (device -> control station)
3. Implement mouse event capture and injection
4. Add keyboard event handling
5. Create device registration system

### Phase 3: Account System (Week 5)
1. Implement authentication (JWT)
2. Device-account association
3. Multi-device management UI
4. Session management

### Phase 4: Optimization (Week 6)
1. Adaptive bitrate streaming
2. Frame skipping for poor connections
3. Input prediction/smoothing
4. Connection quality indicators

### Phase 5: Security & Polish (Week 7)
1. End-to-end encryption layer
2. Permission request flow (macOS)
3. Connection consent mechanism
4. Audit logging

## Project Structure

```
tivi/
├── packages/
│   ├── agent/           # macOS device agent (Swift)
│   ├── control/         # Control station (React/Electron)
│   ├── server/          # Signaling server (Node.js)
│   ├── shared/          # Shared types/protocols
│   └── turn/            # TURN/STUN server
├── scripts/             # Build and deployment scripts
└── docs/                # API documentation
```

## Development Commands

```bash
# Initial setup
pnpm install
pnpm run setup

# Development
pnpm run dev              # Start all services
pnpm run dev:agent        # macOS agent only
pnpm run dev:control      # Control station only
pnpm run dev:server       # Signaling server only

# Building
pnpm run build            # Build all packages
pnpm run build:agent      # Build macOS app
pnpm run build:control    # Build Electron app

# Testing
pnpm run test             # Run all tests
pnpm run test:e2e         # End-to-end tests
```

## Critical macOS Permissions

The agent requires these entitlements:
- `com.apple.security.accessibility` - Mouse/keyboard control
- `com.apple.security.screencapture` - Screen recording
- `com.apple.security.network.client` - Network access

## WebRTC Configuration

```javascript
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.tivi.local:3478' },
    { 
      urls: 'turn:turn.tivi.local:3478',
      username: 'dynamic',
      credential: 'generated'
    }
  ],
  iceCandidatePoolSize: 10
};
```

## Security Considerations

1. All connections require mutual consent
2. WebRTC encryption (DTLS-SRTP) mandatory
3. Additional E2E encryption for control messages
4. Rate limiting on all APIs
5. Session tokens expire after 24 hours
6. Device agents authenticate via certificate pinning

## Performance Targets

- Latency: < 50ms on LAN, < 150ms on WAN
- Frame rate: 30fps minimum, 60fps target
- Resolution: Adaptive (480p to 4K)
- Bandwidth: 500Kbps - 10Mbps adaptive

## Database Schema (PostgreSQL)

```sql
-- Core tables
accounts (id, email, password_hash, created_at)
devices (id, account_id, name, mac_address, public_key, last_seen)
sessions (id, account_id, device_id, token, expires_at)
access_logs (id, account_id, device_id, action, timestamp)
```

## Third-party Dependencies

- **WebRTC**: libwebrtc or simple-peer
- **Screen Capture**: AVFoundation (macOS native)
- **Video Encoding**: VideoToolbox (macOS native)
- **Networking**: Socket.io, express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: jsonwebtoken, bcrypt

## Next Steps for Implementation

1. Initialize monorepo with pnpm workspaces
2. Create Swift package for macOS agent
3. Set up WebRTC signaling server
4. Implement basic screen capture
5. Establish WebRTC connection
6. Add mouse/keyboard event handling