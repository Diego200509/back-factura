import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../../shared/config";
import { InvoiceEntity } from "./entities/InvoiceEntity";
import { InvoiceItemEntity } from "./entities/InvoiceItemEntity";

export class Database {
  private static instance: DataSource;

  private constructor() {}

  /**
   * Devuelve la instancia única de DataSource, inicializándola
   * en la primera llamada.
   */
  public static async getInstance(): Promise<DataSource> {
    if (!Database.instance) {
      Database.instance = new DataSource({
        type: config.DB_TYPE,
        host: config.DB_HOST,
        port: config.DB_PORT,
        username: config.DB_USER,
        password: config.DB_PASS,
        database: config.DB_NAME,
        entities: [InvoiceEntity, InvoiceItemEntity],
        synchronize: true,
        logging: false,
      });

      await Database.instance.initialize();
    }

    return Database.instance;
  }
}
