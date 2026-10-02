// backend/src/controllers/product.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, isAvailable } = req.query;

    const whereClause: any = {};

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && typeof category === 'string' && category !== 'all') {
      whereClause.category = {
        OR: [{ id: category }, { slug: category }],
      };
    }

    if (isAvailable !== undefined) {
      whereClause.isAvailable = isAvailable === 'true';
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, categoryId, price, stock, description, imageUrl, isAvailable } = req.body;

    if (!name || !categoryId || price === undefined || !imageUrl) {
      res.status(400).json({
        success: false,
        message: 'Nama produk, kategori, harga, dan foto produk wajib diisi.',
      });
      return;
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        categoryId,
        price: Number(price),
        stock: Number(stock) || 0,
        description: description || '',
        imageUrl,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : Number(stock) > 0,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan ke katalog.',
      data: newProduct,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, categoryId, price, stock, description, imageUrl, isAvailable } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        categoryId: categoryId ?? existing.categoryId,
        price: price !== undefined ? Number(price) : existing.price,
        stock: stock !== undefined ? Number(stock) : existing.stock,
        description: description ?? existing.description,
        imageUrl: imageUrl ?? existing.imageUrl,
        isAvailable:
          isAvailable !== undefined
            ? Boolean(isAvailable)
            : stock !== undefined
            ? Number(stock) > 0
            : existing.isAvailable,
      },
      include: {
        category: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Data produk berhasil diperbarui.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
      return;
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus dari katalog.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
