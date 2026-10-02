// backend/src/controllers/analytics.controller.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma';

export const logVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    
    // Hash IP for privacy compliance
    const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex').substring(0, 16);

    const log = await prisma.visitorLog.create({
      data: {
        userAgent,
        ipHash,
        visitedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Kunjungan berhasil dicatat.',
      visitorId: log.id,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalProducts, totalOrders, totalVisits, recentOrders, completedOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.visitorLog.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        where: {
          status: { in: ['COMPLETED', 'CONFIRMED'] },
        },
        select: { totalAmount: true },
      }),
    ]);

    const totalRevenue = completedOrders.reduce((sum, ord) => sum + Number(ord.totalAmount), 0);

    // Calculate last 7 days visitor trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentVisits = await prisma.visitorLog.findMany({
      where: {
        visitedAt: { gte: sevenDaysAgo },
      },
      select: { visitedAt: true },
      orderBy: { visitedAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalWebsiteVisits: totalVisits,
        totalRevenue,
        recentOrders,
        recentVisitsCount7d: recentVisits.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
