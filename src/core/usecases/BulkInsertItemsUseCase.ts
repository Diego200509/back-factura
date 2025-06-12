import { IInvoiceItemRepo } from "../repos/IInvoiceItemRepo";
import { InvoiceItem } from "../entities/InvoiceItem";

export class BulkInsertItemsUseCase {
  constructor(private itemRepo: IInvoiceItemRepo) {}

  async execute(items: InvoiceItem[]): Promise<void> {
    return this.itemRepo.bulkInsert(items);
  }
}
