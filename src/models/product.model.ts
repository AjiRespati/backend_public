import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export default class Product extends Model {
  public id!: number;
  public name!: string;
  public price!: number;
  public stock!: number;
  public image?: string;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING },
  },
  { sequelize, modelName: 'Product' }
);
