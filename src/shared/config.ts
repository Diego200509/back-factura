import dotenv from "dotenv";
dotenv.config();

export const config = {
  DB_TYPE: (process.env.DB_TYPE ?? "mysql") as any,
  DB_HOST: process.env.DB_HOST ?? "localhost",
  DB_PORT: Number(process.env.DB_PORT ?? 3306),
  DB_USER: process.env.DB_USER ?? "root",
  DB_PASS: process.env.DB_PASS ?? "",
  DB_NAME: process.env.DB_NAME ?? "invoices_db",
  SERVER_PORT: Number(process.env.SERVER_PORT ?? 3000),
};