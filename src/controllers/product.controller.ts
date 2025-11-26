import { Request, Response } from 'express';
import Product from '../models/product.model';
import { createError } from '../middlewares/error.middleware';

export const getAllProducts = async (_req: Request, res: Response) => {
  const products = await Product.findAll();
  res.json({ success: true, data: products });
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw createError(404, 'Product not found');
  res.json({ success: true, data: product });
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, stock } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const product = await Product.create({ name, price, stock, image });
  res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { name, price, stock } = req.body;
  const product = await Product.findByPk(req.params.id);
  if (!product) throw createError(404, 'Product not found');

  const image = req.file ? `/uploads/${req.file.filename}` : product.image;
  await product.update({ name, price, stock, image });
  res.json({ success: true, data: product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw createError(404, 'Product not found');
  await product.destroy();
  res.json({ success: true, message: 'Product deleted' });
};
