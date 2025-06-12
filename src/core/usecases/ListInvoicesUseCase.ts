import { IInvoiceRepo } from "../repos/IInvoiceRepo";
import { Invoice } from "../entities/Invoice";

export class ListInvoicesUseCase {
  constructor(private invoiceRepo: IInvoiceRepo) {}

  /**
   * @param params.page número de página (1-based)
   * @param params.pageSize tamaño de página
   */
  async execute(params?: { page: number; pageSize: number }): Promise<Invoice[]> {
    // Si no hay params, lista TODO sin paginar
    if (!params) {
      return this.invoiceRepo.listAll();
    }

    const { page, pageSize } = params;
    const skip = page > 1 ? (page - 1) * pageSize : 0;
    // take siempre es un número aquí
    const take = pageSize;

    return this.invoiceRepo.listAll({ skip, take });
  }
}
