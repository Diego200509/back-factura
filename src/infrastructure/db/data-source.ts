import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../../shared/config";

// Entidades actuales
import { InvoiceEntity } from "./entities/InvoiceEntity";
import { InvoiceItemEntity } from "./entities/InvoiceItemEntity";

// Nuevas entidades agregadas
import { CustomerEntity } from "./entities/CustomerEntity";
import { ProductEntity } from "./entities/ProductEntity";

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
        entities: [
          InvoiceEntity,
          InvoiceItemEntity,
          CustomerEntity,
          ProductEntity
        ],
        synchronize: false,
        logging: false,
        extra: {
          // Aumentamos el pool de conexiones a 20
          connectionLimit: 20
        }
      });

      await Database.instance.initialize();
    }

    return Database.instance;
  }
}
