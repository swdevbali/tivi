import { Router } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../auth/jwt.js';

export const authRouter = Router();

const users = new Map();

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}`;
    
    users.set(email, {
      id: userId,
      email,
      password: hashedPassword
    });
    
    const token = generateToken({ userId, email });
    
    res.json({ token, userId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken({ userId: user.id, email });
    
    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});