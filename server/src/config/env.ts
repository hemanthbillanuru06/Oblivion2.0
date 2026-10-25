import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oblivion_marketplace',
  jwtSecret: process.env.JWT_SECRET || 'oblivion_default_secret_dev_key',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
  paymentKeyId: process.env.PAYMENT_PROVIDER_KEY_ID || 'mock_key_id',
  paymentKeySecret: process.env.PAYMENT_PROVIDER_KEY_SECRET || 'mock_secret_key',
};
