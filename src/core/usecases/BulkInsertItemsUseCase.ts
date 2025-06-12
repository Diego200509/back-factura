import { IInvoiceItemRepo } from "../repos/IInvoiceItemRepo";
import { InvoiceItem } from "../entities/InvoiceItem";

export class BulkInsertItemsUseCase {
  constructor(private itemRepo: IInvoiceItemRepo) {}

  async execute(
    itemsDto: {
      invoiceId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }[]
  ): Promise<number> {
    // Mapea a objetos de dominio
    const items = itemsDto.map(
      (i) =>
        new InvoiceItem(
          "",          
          i.invoiceId,
          i.productName,
          i.quantity,
          i.unitPrice
        )
    );
    await this.itemRepo.bulkInsert(items);
    return items.length;
  }
}
