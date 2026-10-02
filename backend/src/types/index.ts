// backend/src/types/index.ts
import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  isAvailable?: boolean;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}
