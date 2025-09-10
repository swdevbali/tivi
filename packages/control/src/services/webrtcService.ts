import SimplePeer from 'simple-peer';
import { MouseEvent, KeyboardEvent } from '@tivi/shared';
import { socketService } from './socketService';

export class WebRTCService extends EventTarget {
  private peer: SimplePeer.Instance | null = null;
  private deviceId: string;
  private socket: typeof socketService;
  private dataChannel: RTCDataChannel | null = null;

  constructor(deviceId: string, socket: typeof socketService) {
    super();
    this.deviceId = deviceId;
    this.socket = socket;
  }

  async connect() {
    this.peer = new SimplePeer({
      initiator: true,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    this.peer.on('signal', (data) => {
      if (data.type === 'offer') {
        this.socket.emit('webrtc:offer', {
          targetDeviceId: this.deviceId,
          payload: data
        });
      } else if (data.candidate) {
        this.socket.emit('webrtc:ice-candidate', {
          targetDeviceId: this.deviceId,
          payload: data
        });
      }
    });

    this.peer.on('stream', (stream) => {
      this.dispatchEvent(new CustomEvent('stream', { detail: stream }));
    });

    this.peer.on('connect', () => {
      console.log('WebRTC connection established');
      this.dispatchEvent(new CustomEvent('connectionStateChange', { detail: 'connected' }));
    });

    this.peer.on('close', () => {
      this.dispatchEvent(new CustomEvent('connectionStateChange', { detail: 'disconnected' }));
    });

    this.peer.on('error', (err) => {
      console.error('WebRTC error:', err);
      this.dispatchEvent(new CustomEvent('connectionStateChange', { detail: 'failed' }));
    });

    this.socket.on('webrtc:answer', (data: any) => {
      if (data.sourceDeviceId === this.deviceId) {
        this.peer?.signal(data.payload);
      }
    });

    this.socket.on('webrtc:ice-candidate', (data: any) => {
      if (data.sourceDeviceId === this.deviceId) {
        this.peer?.signal(data.payload);
      }
    });
  }

  disconnect() {
    this.peer?.destroy();
    this.peer = null;
    this.dataChannel = null;
    this.socket.off('webrtc:answer');
    this.socket.off('webrtc:ice-candidate');
  }

  sendMouseEvent(event: MouseEvent) {
    if (this.peer && this.peer.connected) {
      const message = JSON.stringify({ type: 'mouse', event });
      this.peer.send(message);
    }
  }

  sendKeyboardEvent(event: KeyboardEvent) {
    if (this.peer && this.peer.connected) {
      const message = JSON.stringify({ type: 'keyboard', event });
      this.peer.send(message);
    }
  }

  on(event: string, handler: Function) {
    this.addEventListener(event, handler as EventListener);
  }

  off(event: string, handler: Function) {
    this.removeEventListener(event, handler as EventListener);
  }
}