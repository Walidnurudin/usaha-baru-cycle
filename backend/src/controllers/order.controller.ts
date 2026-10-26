// backend/src/controllers/order.controller.ts
import { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { PdfService } from '../services/pdf.service';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      customerWa,
      productName,
      totalAmount,
      status,
      productId,
      quantity = 1,
      deductStock = false,
      notes,
    } = req.body;

    if (!customerName || !customerWa || !productName || totalAmount === undefined) {
      res.status(400).json({
        success: false,
        message: 'Nama pelanggan, nomor WhatsApp, nama produk, dan total harga wajib diisi.',
      });
      return;
    }

    // Clean phone number (e.g. 0812... -> 62812...)
    let sanitizedPhone = customerWa.replace(/[^0-9]/g, '');
    if (sanitizedPhone.startsWith('0')) {
      sanitizedPhone = '62' + sanitizedPhone.substring(1);
    }

    // Validate or assign status (default to COMPLETED since order is already finalized/paid)
    let orderStatus: OrderStatus = OrderStatus.COMPLETED;
    if (status && Object.values(OrderStatus).includes(status)) {
      orderStatus = status as OrderStatus;
    }

    const qtyNumber = Math.max(1, Number(quantity) || 1);

    // If productId is provided and deductStock is requested, update stock atomically
    if (productId && deductStock) {
      const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (product) {
          const newStock = Math.max(0, product.stock - qtyNumber);
          await tx.product.update({
            where: { id: productId },
            data: {
              stock: newStock,
              isAvailable: newStock > 0 ? product.isAvailable : false,
            },
          });
        }

        const newOrder = await tx.order.create({
          data: {
            customerName: customerName.trim(),
            customerWa: sanitizedPhone,
            productName: productName.trim(),
            totalAmount: Number(totalAmount),
            status: orderStatus,
            notes: notes || 'Deal pemesanan via WhatsApp Usaha Baru Cycle',
          },
        });

        return newOrder;
      });

      res.status(201).json({
        success: true,
        message: 'Pesanan manual berhasil dicatat dan stok produk disinkronkan.',
        data: result,
      });
      return;
    }

    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        customerWa: sanitizedPhone,
        productName: productName.trim(),
        totalAmount: Number(totalAmount),
        status: orderStatus,
        notes: notes || 'Deal pemesanan via WhatsApp Usaha Baru Cycle',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pesanan manual berhasil dicatat.',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
      return;
    }

    await prisma.order.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Pesanan berhasil dihapus.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, startDate, endDate, search } = req.query;

    const whereClause: any = {};

    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status as OrderStatus;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerWa: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status pesanan tidak valid.',
      });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      success: true,
      message: 'Status pesanan berhasil diperbarui.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportSalesReportPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause: any = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate && typeof startDate === 'string') {
        whereClause.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate && typeof endDate === 'string') {
        whereClause.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    const pdfBuffer = PdfService.generateSalesReport({
      startDate: startDate as string,
      endDate: endDate as string,
      orders: orders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        customerWa: o.customerWa,
        productName: o.productName,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt,
      })),
    });

    const filename = `Laporan_Penjualan_UsahaBaruCycle_${startDate || 'Awal'}_sd_${endDate || 'Sekarang'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.status(200).end(pdfBuffer);
  } catch (error: any) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal membuat laporan PDF.' });
  }
};
