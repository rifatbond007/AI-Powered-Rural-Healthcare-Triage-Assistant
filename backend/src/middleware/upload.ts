import multer from "multer";
import path from "node:path";
import { config } from "../config.js";

const storage = multer.diskStorage({
  destination: path.resolve("uploads"),
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const maxBytes = config.maxFileSizeMb * 1024 * 1024;

export const uploadAudio = multer({
  storage,
  limits: { fileSize: maxBytes },
  fileFilter(_req, file, cb) {
    const allowed = ["audio/mpeg", "audio/wav", "audio/webm", "audio/ogg", "audio/mp4"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio type: ${file.mimetype}`));
    }
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: maxBytes },
  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image type: ${file.mimetype}`));
    }
  },
});
