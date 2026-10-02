// backend/src/routes/upload.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { uploadProductImage } from '../controllers/upload.controller';
import { requireAdminAuth } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Upload image (Admin only)
router.post('/', requireAdminAuth, upload.single('image'), uploadProductImage);

export default router;
