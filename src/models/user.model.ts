import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export default class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare role: string;
  declare refreshToken: string;
  declare resetToken: string;
  declare verificationToken: string;
  declare password: string;
  declare verified: boolean;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "cashier"), defaultValue: "cashier" },
    refreshToken: { type: DataTypes.STRING, allowNull: true },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    verificationToken: { type: DataTypes.STRING, allowNull: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);
