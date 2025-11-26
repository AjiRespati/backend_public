import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { createError } from '../middlewares/error.middleware';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ where: { email } });
  if (existing) throw createError(400, 'Email already exists');

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });
  res.status(201).json({ success: true, data: user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) throw createError(404, 'User not found');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw createError(401, 'Invalid credentials');

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.json({ success: true, token });
};
