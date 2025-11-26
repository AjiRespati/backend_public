import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';

class Sale extends Model {
  public id!: number;
  public userId!: number;
  public total!: number;
  public createdAt!: Date;
}

Sale.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, modelName: 'Sale', tableName: 'sales' }
);

// Relation: Sale belongs to User
Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Sale;
