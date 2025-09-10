import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost/tivi',
  TURN_SERVER_URL: process.env.TURN_SERVER_URL || 'turn:localhost:3478',
  TURN_USERNAME: process.env.TURN_USERNAME || 'tivi',
  TURN_PASSWORD: process.env.TURN_PASSWORD || 'tivi-turn-password'
};