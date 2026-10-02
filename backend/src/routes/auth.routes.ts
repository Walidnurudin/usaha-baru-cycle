// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller';
import { requireAdminAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', requireAdminAuth, getMe);

export default router;
