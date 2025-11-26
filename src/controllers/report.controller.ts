import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import Sale from "../models/sale.model";
import SaleItem from "../models/saleItem.model";
import Product from "../models/product.model";
import User from "../models/user.model";
import { createError } from "../middlewares/error.middleware";

/**
 * GET /api/reports/sales
 * Query params:
 *   - startDate=YYYY-MM-DD
 *   - endDate=YYYY-MM-DD
 *   - userId (optional)
 */
export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, userId } = req.query;

    if (!startDate || !endDate)
      throw createError(400, "startDate and endDate are required");

    const whereClause: any = {
      createdAt: {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      },
    };

    if (userId) whereClause.userId = userId;

    const sales = await Sale.findAll({
      where: whereClause,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "role"] },
        {
          model: SaleItem,
          as: "items",
          include: [{ model: Product, as: "product", attributes: ["id", "name", "price"] }],
        },
      ],
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = sales.length;

    res.json({
      success: true,
      summary: { totalRevenue, totalTransactions },
      data: sales,
    });
  } catch (err) {
    throw createError(500, "Failed to generate report", err);
  }
};

/**
 * GET /api/reports/top-products
 * Query params:
 *   - startDate
 *   - endDate
 */
export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate)
      throw createError(400, "startDate and endDate are required");

    const products = await SaleItem.findAll({
      attributes: [
        "productId",
        [fn("SUM", col("quantity")), "totalSold"],
        [fn("SUM", literal("quantity * price")), "totalRevenue"],
      ],
      include: [{ model: Product, as: "product", attributes: ["id", "name", "price"] }],
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
        },
      },
      group: ["productId", "product.id"],
      order: [[literal("totalSold"), "DESC"]],
      limit: 10,
    });

    res.json({ success: true, data: products });
  } catch (err) {
    throw createError(500, "Failed to generate top products report", err);
  }
};

/**
* GET /api/reports/cashier-performance
*/
export const getCashierPerformance = async (_req: Request, res: Response) => {
  try {
    const performance = await Sale.findAll({
      attributes: [
        "userId",
        [fn("COUNT", col("id")), "transactions"],
        [fn("SUM", col("total")), "revenue"],
      ],
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
      group: ["userId", "user.id"],
      order: [[literal("revenue"), "DESC"]],
    });

    res.json({ success: true, data: performance });
  } catch (err) {
    throw createError(500, "Failed to generate cashier performance report", err);
  }
};

