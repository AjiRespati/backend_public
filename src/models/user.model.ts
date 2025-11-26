import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: "admin" | "cashier";
  public refreshToken?: string | null;
  public resetToken?: string | null;
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
  },
  { sequelize, modelName: "User", tableName: "users" }
);

export default User;
