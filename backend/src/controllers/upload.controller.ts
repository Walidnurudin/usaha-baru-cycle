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

    // Validasi ukuran maksimal 2MB
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (req.file.size > MAX_FILE_SIZE) {
      res.status(400).json({
        success: false,
        message: 'Ukuran file gambar maksimal 2MB.',
      });
      return;
    }

    // Validasi ketersediaan BLOB_READ_WRITE_TOKEN
    if (
      !env.BLOB_READ_WRITE_TOKEN ||
      env.BLOB_READ_WRITE_TOKEN.trim() === '' ||
      env.BLOB_READ_WRITE_TOKEN.includes('xxxxxxxx')
    ) {
      res.status(500).json({
        success: false,
        message:
          'Vercel Blob Storage belum dikonfigurasi. Harap masukkan BLOB_READ_WRITE_TOKEN dari dashboard Vercel Stores ke backend/.env.',
      });
      return;
    }

    // Penamaan file unik untuk Vercel Blob
    const fileExt = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const randomHash = crypto.randomBytes(8).toString('hex');
    const safePathname = `products/usaha-baru-${Date.now()}-${randomHash}${fileExt}`;

    // Upload langsung ke Vercel Blob Storage (akses publik CDN)
    const blob = await put(safePathname, req.file.buffer, {
      access: 'public',
      token: env.BLOB_READ_WRITE_TOKEN,
      contentType: req.file.mimetype,
    });

    res.status(200).json({
      success: true,
      message: 'Foto produk berhasil diunggah ke Vercel Blob Storage.',
      data: {
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
      },
    });
  } catch (error: any) {
    console.error('Vercel Blob Upload Error:', error);
    res.status(500).json({
      success: false,
      message: `Gagal mengunggah foto ke Vercel Blob Storage: ${error.message || 'Terjadi kesalahan sistem'}`,
    });
  }
};


