import { Sequelize } from "sequelize-typescript";
import { UserModel } from "./models/UserModel";

export const sequelize = new Sequelize({
    dialect: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_AUTH_PASSWORD,
    host: process.env.DB_AUTH_HOST,
    port: parseInt(process.env.DB_AUTH_PORT ?? '5432'),
    models: [UserModel]
})