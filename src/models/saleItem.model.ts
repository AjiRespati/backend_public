import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export default class SaleItem extends Model {
  declare id: number;
  declare saleId: number;
  declare productId: number;
  declare quantity: number;
  declare price: number;
}

SaleItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    saleId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    sequelize,
    modelName: "SaleItem",
    tableName: "sale_items",
    timestamps: true,
  }
);
