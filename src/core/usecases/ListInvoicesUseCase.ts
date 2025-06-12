import { IInvoiceRepo } from "../repos/IInvoiceRepo";
import { Invoice } from "../entities/Invoice";

export class ListInvoicesUseCase {
  constructor(private invoiceRepo: IInvoiceRepo) {}

  async execute(): Promise<Invoice[]> {
    return this.invoiceRepo.listAll();
  }
}
