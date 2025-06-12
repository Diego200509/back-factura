import { Repository, DataSource } from "typeorm";
import { IInvoiceRepo } from "../../core/repos/IInvoiceRepo";
import { Invoice } from "../../core/entities/Invoice";
import { InvoiceEntity } from "../db/entities/InvoiceEntity";
import { InvoiceItemEntity } from "../db/entities/InvoiceItemEntity";

export class InvoiceRepo implements IInvoiceRepo {
  private repo: Repository<InvoiceEntity>;
  private itemRepo: Repository<InvoiceItemEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(InvoiceEntity);
    this.itemRepo = dataSource.getRepository(InvoiceItemEntity);
  }

  async create(inv: Invoice): Promise<Invoice> {
    // Prepara la entidad incluyendo items
    const entity = this.repo.create({
      customerName: inv.customerName,
      date: inv.date,
      items: inv.items.map(i =>
        this.itemRepo.create({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })
      ),
    });

    const saved = await this.repo.save(entity);

    // Mapea de vuelta a dominio
    return new Invoice(
      saved.id,
      saved.customerName,
      saved.date,
      saved.items.map(i => ({
        id: i.id,
        invoiceId: saved.id,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      }))
    );
  }

  async findById(id: string): Promise<Invoice | null> {
    const e = await this.repo.findOne({
      where: { id },
      relations: ["items"],
    });
    if (!e) return null;

    return new Invoice(
      e.id,
      e.customerName,
      e.date,
      e.items.map(i => ({
        id: i.id,
        invoiceId: e.id,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      }))
    );
  }

  async listAll(): Promise<Invoice[]> {
    const list = await this.repo.find({ relations: ["items"] });
    return list.map(e =>
      new Invoice(
        e.id,
        e.customerName,
        e.date,
        e.items.map(i => ({
          id: i.id,
          invoiceId: e.id,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        }))
      )
    );
  }
}
