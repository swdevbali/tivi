export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'macos' | 'windows' | 'linux';
  osVersion: string;
  macAddress?: string;
  ipAddress?: string;
  online: boolean;
  lastSeen: string;
  capabilities: DeviceCapabilities;
}

export interface DeviceCapabilities {
  screenShare: boolean;
  remoteControl: boolean;
  fileTransfer: boolean;
  audioShare: boolean;
  multiMonitor: boolean;
  resolution: {
    width: number;
    height: number;
  };
}