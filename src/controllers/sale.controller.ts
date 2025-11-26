import { Request, Response } from 'express';
import sequelize from '../config/db';
import Sale from '../models/sale.model';
import SaleItem from '../models/saleItem.model';
import Product from '../models/product.model';
import { createError } from '../middlewares/error.middleware';

export const createSale = async (req: Request, res: Response) => {
  const { items } = req.body; // [{productId, quantity}]
  const userId = (req as any).user.id;

  const transaction = await sequelize.transaction();

  try {
    let total = 0;
    const sale = await Sale.create({ userId, total: 0 }, { transaction });

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) throw createError(404, `Product not found: ${item.productId}`);

      if (product.stock < item.quantity)
        throw createError(400, `Insufficient stock for ${product.name}`);

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      await SaleItem.create(
        {
          saleId: sale.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        },
        { transaction }
      );

      // Deduct stock
      await product.update({ stock: product.stock - item.quantity }, { transaction });
    }

    // Update sale total
    await sale.update({ total }, { transaction });

    await transaction.commit();
    res.status(201).json({ success: true, saleId: sale.id, total });
  } catch (error) {
    await transaction.rollback();
    throw createError(500, 'Sale transaction failed', error);
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
