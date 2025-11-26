import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class Product extends Model {
  public id!: number;
  public name!: string;
  public price!: number;
  public stock!: number;
  public image!: string | null;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    image: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: 'Product', tableName: 'products' }
);

export default Product;
