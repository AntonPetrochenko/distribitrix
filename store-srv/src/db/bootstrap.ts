
import { Sequelize } from "sequelize-typescript";
import { sequelize } from "./connection";
import { ProductModel } from "./models/ProductModel";

export class DatabaseContainer {
    static database: Sequelize;

    static async getInstance() {
        // Синглтон из сайдеффекта? Пукнул мозгом, но оставляем
        
        if (this.database) return this.database;
        
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm'); // Триграммы хочу
        ProductModel.sync()

        return this.database // забутстрапченый...
    }
}