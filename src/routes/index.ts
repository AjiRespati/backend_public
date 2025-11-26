import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import reportRoutes from './report.routes';
import saleRoutes from './sale.routes';
// import customerRoutes from './customer.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use("/reports", reportRoutes);
// router.use('/customers', customerRoutes);

export default router;
