import { Invoice } from "../entities/Invoice";

export interface IInvoiceRepo {
  /**
   * Crea y persiste una nueva factura (con sus items en cascade).
   * @param invoice La factura de dominio a guardar.
   * @returns La factura guardada, con su id y demás campos poblados.
   */
  create(invoice: Invoice): Promise<Invoice>;

  /**
   * Busca una factura por su identificador.
   * @param id UUID de la factura.
   * @returns La factura con sus items o null si no existe.
   */
  findById(id: string): Promise<Invoice | null>;

  /**
  * Lista facturas paginadas junto con sus items.
  * @param options.skip cuántos registros saltar (offset)
  * @param options.take cuántos registros traer (limit)
  */
  listAll(options?: { skip: number; take: number }): Promise<Invoice[]>;
}
