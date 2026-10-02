// backend/src/controllers/upload.controller.ts
import { Request, Response } from 'express';
import { put } from '@vercel/blob';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env';

export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'File gambar produk wajib diunggah.',
      });
      return;
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      res.status(400).json({
        success: false,
        message: 'Format file tidak didukung. Harap unggah gambar JPG, PNG, atau WEBP.',
      });
      return;
    }

    // Check size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        message: 'Ukuran file gambar maksimal 5MB.',
      });
      return;
    }

    const fileExt = path.extname(req.file.originalname) || '.jpg';
    const randomHash = crypto.randomBytes(8).toString('hex');
    const safeName = `products/usaha-baru-${Date.now()}-${randomHash}${fileExt}`;

    // Upload to Vercel Blob Storage
    if (env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(safeName, req.file.buffer, {
        access: 'public',
        token: env.BLOB_READ_WRITE_TOKEN,
      });

      res.status(200).json({
        success: true,
        message: 'Foto produk berhasil diunggah ke Vercel Blob.',
        data: {
          url: blob.url,
          downloadUrl: blob.downloadUrl,
          pathname: blob.pathname,
        },
      });
      return;
    }

    // Development Fallback if token is not set yet
    console.warn('⚠️ BLOB_READ_WRITE_TOKEN belum diset di .env. Menggunakan data URL fallback untuk mode development.');
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.status(200).json({
      success: true,
      message: 'Foto produk berhasil diproses (Dev Fallback Data URL).',
      data: {
        url: dataUrl,
      },
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengunggah foto ke penyimpanan cloud.',
    });
  }
};
