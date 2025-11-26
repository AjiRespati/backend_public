import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export default class Customer extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone?: string;
}

Customer.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: 'Customer' }
);
