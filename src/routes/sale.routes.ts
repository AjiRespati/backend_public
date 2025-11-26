import { Router } from 'express';
import { createSale, getSales, getSaleById } from '../controllers/sale.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createSale);
router.get('/', authenticate, getSales);
router.get('/:id', authenticate, getSaleById);

export default router;
