import { IInvoiceRepo } from "../repos/IInvoiceRepo";
import { Invoice } from "../entities/Invoice";

export class ListInvoicesUseCase {
  constructor(private invoiceRepo: IInvoiceRepo) {}

  /**
   * Lista facturas opcionalmente paginadas y filtradas por nombre de cliente.
   * @param params.page número de página (1-based)
   * @param params.pageSize tamaño de página
   * @param params.customerName filtro opcional por nombre de cliente
   */
  async execute(params?: {
    page?: number;
    pageSize?: number;
    customerName?: string;
  }): Promise<Invoice[]> {
    // sin params listamos todo
    if (!params) {
      return this.invoiceRepo.listAll();
    }

    const { page, pageSize, customerName } = params;

    // calculamos skip/take solo si vienen page y pageSize
    const skip = page && page > 1 ? (page - 1) * (pageSize ?? 0) : undefined;
    const take = pageSize;

    return this.invoiceRepo.listAll({
      skip,
      take,
      customerName,
    });
  }
}
