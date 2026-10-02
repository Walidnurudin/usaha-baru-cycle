// backend/src/routes/order.routes.ts
import { Router } from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  exportSalesReportPdf,
} from '../controllers/order.controller';
import { requireAdminAuth } from '../middlewares/auth.middleware';

const router = Router();

// Public: Customer creates inquiry/order
router.post('/', createOrder);

// Admin: Export PDF sales report by date range
router.get('/report', requireAdminAuth, exportSalesReportPdf);

// Admin: List orders with status/date filters
router.get('/', requireAdminAuth, getOrders);

// Admin: Update order status
router.patch('/:id/status', requireAdminAuth, updateOrderStatus);

export default router;
