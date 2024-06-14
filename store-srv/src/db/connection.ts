import { Sequelize } from "sequelize-typescript";
import { ProductModel } from "./models/ProductModel";

export const sequelize = new Sequelize({
    dialect: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432'),
    models: [ProductModel]
})