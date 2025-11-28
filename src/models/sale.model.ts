import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export default class Sale extends Model {
  declare id: number;
  declare userId: number | null;
  declare total: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Sale.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    total: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    sequelize,
    modelName: "Sale",
    tableName: "sales",
    timestamps: true,
  }
);
