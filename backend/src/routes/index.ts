// backend/src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import uploadRoutes from './upload.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/upload', uploadRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
