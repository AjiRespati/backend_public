import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllProducts);
router.get('/:id', authenticate, getProductById);
router.post('/', authenticate, authorize('admin'), upload.single('image'), createProduct);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
