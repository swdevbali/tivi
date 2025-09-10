import { Router } from 'express';
import { generateToken } from '../auth/jwt.js';

export const deviceRouter = Router();

const devices = new Map();

deviceRouter.post('/register', async (req, res) => {
  try {
    const { name, macAddress, userId } = req.body;
    
    const deviceId = `device_${Date.now()}`;
    
    devices.set(deviceId, {
      id: deviceId,
      name,
      macAddress,
      userId,
      createdAt: new Date().toISOString()
    });
    
    const token = generateToken({ userId, deviceId });
    
    res.json({ token, deviceId });
  } catch (error) {
    res.status(500).json({ error: 'Device registration failed' });
  }
});

deviceRouter.get('/list/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userDevices = Array.from(devices.values()).filter(
      device => device.userId === userId
    );
    
    res.json(userDevices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});