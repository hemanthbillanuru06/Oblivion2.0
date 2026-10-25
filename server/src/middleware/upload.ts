import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max limit
  },
  fileFilter: (req, file, cb) => {
    // allow images, pdfs, documents, zip, code, presentations
    const allowedExtensions = /jpeg|jpg|png|webp|gif|pdf|doc|docx|ppt|pptx|txt|zip|json|js|ts|py|html|css/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowedExtensions.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} is not supported.`));
    }
  },
});
