export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  targetDeviceId: string;
  sourceDeviceId?: string;
  payload: any;
}

export interface WebRTCOffer {
  sdp: string;
  type: 'offer';
}

export interface WebRTCAnswer {
  sdp: string;
  type: 'answer';
}

export interface ICECandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  latency: number;
  bandwidth: {
    upload: number;
    download: number;
  };
}