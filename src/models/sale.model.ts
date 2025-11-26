import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';
import Customer from './customer.model';

export default class Sale extends Model {
  public id!: number;
  public total!: number;
  public userId!: number;
  public customerId!: number;
}

Sale.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { sequelize, modelName: 'Sale' }
);

Sale.belongsTo(User, { foreignKey: 'userId' });
Sale.belongsTo(Customer, { foreignKey: 'customerId' });
