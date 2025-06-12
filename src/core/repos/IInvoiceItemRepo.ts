import { InvoiceItem } from "../entities/InvoiceItem";

export interface IInvoiceItemRepo {
  /**
   * Inserta masivamente un array de items sin necesidad de crear factura.
   * Ideal para cargas o generación de datos de prueba.
   * @param items Lista de items de dominio.
   */
  bulkInsert(items: InvoiceItem[]): Promise<void>;
}
