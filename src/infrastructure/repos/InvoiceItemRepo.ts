import { Repository, DataSource } from "typeorm";
import { IInvoiceItemRepo } from "../../core/repos/IInvoiceItemRepo";
import { InvoiceItem } from "../../core/entities/InvoiceItem";
import { InvoiceItemEntity } from "../db/entities/InvoiceItemEntity";

export class InvoiceItemRepo implements IInvoiceItemRepo {
  private repo: Repository<InvoiceItemEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(InvoiceItemEntity);
  }

  async bulkInsert(items: InvoiceItem[]): Promise<void> {
    const entities = items.map(i =>
      this.repo.create({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        invoice: { id: i.invoiceId } as any,
      })
    );
    await this.repo.insert(entities);
  }
}
