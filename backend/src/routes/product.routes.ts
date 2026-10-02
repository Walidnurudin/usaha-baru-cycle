// backend/src/routes/product.routes.ts
import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../controllers/product.controller';
import { requireAdminAuth } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin protected routes
router.post('/', requireAdminAuth, createProduct);
router.put('/:id', requireAdminAuth, updateProduct);
router.delete('/:id', requireAdminAuth, deleteProduct);

export default router;
