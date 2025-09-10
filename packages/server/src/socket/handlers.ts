import { Server as SocketIOServer, Socket } from 'socket.io';
import { SignalingMessage, DeviceInfo } from '@tivi/shared';
import { verifyToken } from '../auth/jwt.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  deviceId?: string;
}

const connectedDevices = new Map<string, DeviceInfo>();
const deviceSockets = new Map<string, string>();

export function setupSocketHandlers(io: SocketIOServer) {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const payload = await verifyToken(token);
      socket.userId = payload.userId;
      socket.deviceId = payload.deviceId;
      next();
    } catch (error) {
      next(new Error('Invalid authentication'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.id}, Device: ${socket.deviceId}`);

    socket.on('device:register', (deviceInfo: DeviceInfo) => {
      if (socket.deviceId) {
        connectedDevices.set(socket.deviceId, {
          ...deviceInfo,
          id: socket.deviceId,
          online: true,
          lastSeen: new Date().toISOString()
        });
        deviceSockets.set(socket.deviceId, socket.id);
        
        socket.emit('device:registered', { deviceId: socket.deviceId });
        io.emit('devices:updated', Array.from(connectedDevices.values()));
      }
    });

    socket.on('device:list', () => {
      socket.emit('devices:list', Array.from(connectedDevices.values()));
    });

    socket.on('webrtc:offer', (data: SignalingMessage) => {
      const targetSocketId = deviceSockets.get(data.targetDeviceId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc:offer', {
          ...data,
          sourceDeviceId: socket.deviceId
        });
      }
    });

    socket.on('webrtc:answer', (data: SignalingMessage) => {
      const targetSocketId = deviceSockets.get(data.targetDeviceId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc:answer', {
          ...data,
          sourceDeviceId: socket.deviceId
        });
      }
    });

    socket.on('webrtc:ice-candidate', (data: SignalingMessage) => {
      const targetSocketId = deviceSockets.get(data.targetDeviceId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc:ice-candidate', {
          ...data,
          sourceDeviceId: socket.deviceId
        });
      }
    });

    socket.on('control:request', (data: { targetDeviceId: string }) => {
      const targetSocketId = deviceSockets.get(data.targetDeviceId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('control:request', {
          requesterId: socket.deviceId,
          requesterName: connectedDevices.get(socket.deviceId!)?.name
        });
      }
    });

    socket.on('control:approve', (data: { requesterId: string }) => {
      const requesterSocketId = deviceSockets.get(data.requesterId);
      if (requesterSocketId) {
        io.to(requesterSocketId).emit('control:approved', {
          deviceId: socket.deviceId
        });
      }
    });

    socket.on('control:deny', (data: { requesterId: string }) => {
      const requesterSocketId = deviceSockets.get(data.requesterId);
      if (requesterSocketId) {
        io.to(requesterSocketId).emit('control:denied', {
          deviceId: socket.deviceId
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      if (socket.deviceId) {
        connectedDevices.delete(socket.deviceId);
        deviceSockets.delete(socket.deviceId);
        io.emit('devices:updated', Array.from(connectedDevices.values()));
      }
    });
  });
}