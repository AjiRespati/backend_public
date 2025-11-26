import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import { generateToken } from '../config/jwt';

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json(user);
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token, user });
};
