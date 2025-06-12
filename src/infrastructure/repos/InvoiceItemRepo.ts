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
    const CHUNK_SIZE = 250;

    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const entities = chunk.map(item =>
        this.repo.create({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          invoice: { id: item.invoiceId } as any,
        })
      );
      await this.repo.insert(entities);
    }
  }
}
