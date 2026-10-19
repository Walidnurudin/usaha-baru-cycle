// backend/src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('💥 Uncaught Application Error:', err);

  // Tangani kesalahan batas ukuran atau format dari Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'Ukuran file gambar maksimal 2MB.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: err.message || 'Kesalahan saat mengunggah file.',
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

