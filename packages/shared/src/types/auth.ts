export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface DeviceAuth {
  deviceId: string;
  token: string;
  userId: string;
}