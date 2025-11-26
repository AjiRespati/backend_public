import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Product from './product.model';
import Sale from './sale.model';

class SaleItem extends Model {
  public id!: number;
  public saleId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number;
}

SaleItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    saleId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, modelName: 'SaleItem', tableName: 'sale_items' }
);

// Relationships
SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export default SaleItem;
