
import { Sequelize } from "sequelize-typescript";
import { sequelize } from "./connection";
import { UserModel } from "./models/UserModel";

export class Database {
    static instance: Sequelize;

    static async getInstance() {
        // Синглтон из сайдеффекта? Пукнул мозгом, но оставляем
        
        if (this.instance) return this.instance;
        
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm'); // Триграммы хочу
        UserModel.sync()

        return this.instance // забутстрапченый...
    }
}