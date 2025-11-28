import { Router } from 'express';
import { createSale, getSales, getSaleById, getSalesStats } from '../controllers/sale.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post("/", authenticate, createSale);
router.get("/stats", authenticate, getSalesStats);
router.get('/', authenticate, getSales);
router.get('/:id', authenticate, getSaleById);

export default router;
