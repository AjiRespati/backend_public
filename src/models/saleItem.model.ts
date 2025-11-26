// saleItem.model.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Sale from './sale.model';
import Product from './product.model';

export default class SaleItem extends Model {
  public id!: number;
  public saleId!: number;
  public productId!: number;
  public quantity!: number;
  public subtotal!: number;
}

SaleItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { sequelize, modelName: 'SaleItem' }
);

SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });
SaleItem.belongsTo(Product, { foreignKey: 'productId' });
