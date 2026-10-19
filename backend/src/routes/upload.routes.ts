// backend/src/routes/upload.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadProductImage } from '../controllers/upload.controller';
import { requireAdminAuth } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Harap unggah gambar JPG, PNG, atau WEBP.'));
    }
  },
});

// Middleware wrapper untuk menangani batas ukuran dan validasi multer secara rapi
const handleMulterUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          message: 'Ukuran file gambar maksimal 2MB.',
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: err.message || 'Gagal memproses unggahan gambar.',
      });
      return;
    }
    next();
  });
};

// Upload image (Admin only)
router.post('/', requireAdminAuth, handleMulterUpload, uploadProductImage);

export default router;
