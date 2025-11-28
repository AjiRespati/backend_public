import { NextFunction, Request, Response } from 'express';
import sequelize from '../config/db';
import Sale from '../models/sale.model';
import SaleItem from '../models/saleItem.model';
import Product from '../models/product.model';
import { createError } from '../middlewares/error.middleware';

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
