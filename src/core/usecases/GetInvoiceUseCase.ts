import { IInvoiceRepo } from "../repos/IInvoiceRepo";
import { Invoice } from "../entities/Invoice";

export class GetInvoiceUseCase {
  constructor(private invoiceRepo: IInvoiceRepo) {}

  async execute(id: string): Promise<Invoice | null> {
    return this.invoiceRepo.findById(id);
  }
}
