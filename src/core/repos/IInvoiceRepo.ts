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
   * Lista todas las facturas junto con sus items.
   */
  listAll(): Promise<Invoice[]>;
}
