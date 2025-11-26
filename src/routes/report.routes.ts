import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  getSalesReport,
  getTopProducts,
  getCashierPerformance,
} from "../controllers/report.controller";

const router = Router();

// Admins only for report access
router.get("/sales", authenticate, authorize("admin"), getSalesReport);
router.get("/top-products", authenticate, authorize("admin"), getTopProducts);
router.get("/cashier-performance", authenticate, authorize("admin"), getCashierPerformance);

export default router;
