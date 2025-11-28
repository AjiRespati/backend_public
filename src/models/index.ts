import sequelize from "../config/db";
import User from "./user.model";
import Product from "./product.model";
import Sale from "./sale.model";
import SaleItem from "./saleItem.model";

// 🔗 Define associations AFTER all models have been imported
User.hasMany(Sale, { foreignKey: "userId" });
Sale.belongsTo(User, { foreignKey: "userId" });

Sale.hasMany(SaleItem, { foreignKey: "saleId", as: "items" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId" });

Product.hasMany(SaleItem, { foreignKey: "productId" });
SaleItem.belongsTo(Product, { foreignKey: "productId" });

export { sequelize, User, Product, Sale, SaleItem };
