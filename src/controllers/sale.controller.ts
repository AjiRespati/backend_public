import { NextFunction, Request, Response } from 'express';
import sequelize from '../config/db';
import Sale from '../models/sale.model';
import SaleItem from '../models/saleItem.model';
import Product from '../models/product.model';
import { createError } from '../middlewares/error.middleware';
import { Op, col, fn, literal } from 'sequelize';

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { items, total } = req.body;
    const userId = (req as any).user?.id || null;

    if (!Array.isArray(items) || typeof total !== "number") {
      throw createError(400, "Invalid sale data");
    }

    const sale = await Sale.create(
      { userId, total },
      { transaction: t }
    );

    if (!sale || !sale.id) {
      throw createError(500, "Failed to create Sale record");
    }

    for (const item of items) {
      const { productId, quantity, price } = item;
      if (!productId || !quantity || !price)
        throw createError(400, "Incomplete sale item data");

      const product = await Product.findByPk(productId, { transaction: t });
      if (!product) throw createError(404, "Product not found");
      if (product.stock < quantity)
        throw createError(400, `Not enough stock for ${product.name}`);

      await SaleItem.create(
        {
          saleId: sale.id,
          productId,
          quantity,
          price,
        },
        { transaction: t }
      );

      await product.update(
        { stock: product.stock - quantity },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ success: true, message: "Sale recorded successfully" });
  } catch (error: any) {
    await t.rollback();
    console.error("Sale transaction failed:", error);
    next(createError(500, error.message || "Sale transaction failed"));
  }
};

export const getSales = async (req: Request, res: Response) => {
  const sales = await Sale.findAll({
    include: [
      { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product' }] },
    ],
  });
  res.json({ success: true, data: sales });
};

export const getSaleById = async (req: Request, res: Response) => {
  const sale = await Sale.findByPk(req.params.id, {
    include: [
      { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product' }] },
    ],
  });
  if (!sale) throw createError(404, 'Sale not found');
  res.json({ success: true, data: sale });
};

export const getSalesStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🧭 1️⃣ Determine range
    const range = (req.query.range as string) || "7";
    const days = parseInt(range, 10) || 7;

    // 🧮 2️⃣ Date filter
    const dateFilter = {
      createdAt: {
        [Op.gte]: literal(`CURRENT_DATE - INTERVAL '${days} days'`),
      },
    };

    // 🧾 3️⃣ Summary
    const [summary] = await Sale.findAll({
      attributes: [
        [fn("COUNT", col("id")), "totalSales"],
        [fn("SUM", col("total")), "totalRevenue"],
      ],
      raw: true,
    });

    // 📈 4️⃣ Revenue per day
    const dailySales = await Sale.findAll({
      attributes: [
        [fn("DATE_TRUNC", "day", col("createdAt")), "date"],
        [fn("SUM", col("total")), "revenue"],
      ],
      where: dateFilter,
      group: [fn("DATE_TRUNC", "day", col("createdAt"))],
      order: [[fn("DATE_TRUNC", "day", col("createdAt")), "ASC"]],
      raw: true,
    });

    // 🏆 5️⃣ Top products (disambiguated + ordered by sum)
    const topProducts = await SaleItem.findAll({
      attributes: [
        "productId",
        [fn("SUM", col("SaleItem.quantity")), "totalSold"],
        [literal('SUM("SaleItem"."quantity" * "SaleItem"."price")'), "revenue"],
      ],
      include: [{ model: Product, attributes: ["name"] }],
      where: dateFilter,
      group: ["SaleItem.productId", "Product.id"],
      order: [[literal('SUM("SaleItem"."quantity")'), "DESC"]],
      limit: 5,
      raw: true,
      nest: true,
    });

    res.json({
      success: true,
      range: days,
      summary,
      dailySales,
      topProducts,
    });
  } catch (error: any) {
    console.error("Error in getSalesStats:", error);
    next(createError(500, error.message || "Failed to fetch sales stats"));
  }
};
