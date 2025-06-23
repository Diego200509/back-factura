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

  async listAll(options?: {
    skip?: number;
    take?: number;
    customerName?: string;
  }): Promise<Invoice[]> {
    const take = options?.take ?? 1000;
    const skip = options?.skip ?? 0;

    const params: any[] = [];
    let whereClause = "";

    if (options?.customerName) {
      whereClause = "WHERE i.customerName LIKE ?";
      params.push(`%${options.customerName}%`);
    }

    params.push(take, skip);

    const raw = await this.dataSource.query(
      `
      SELECT 
        i.id AS invoiceId,
        i.customerName,
        i.date,
        it.id AS itemId,
        it.productName,
        it.quantity,
        it.unitPrice
      FROM invoices i
      JOIN invoice_items it ON it.invoiceId = i.id
      ${whereClause}
      ORDER BY i.date DESC
      LIMIT ? OFFSET ?
      `,
      params
    );

    const grouped = new Map<string, Invoice>();

    for (const row of raw) {
      const {
        invoiceId,
        customerName,
        date,
        itemId,
        productName,
        quantity,
        unitPrice,
      } = row;

      if (!grouped.has(invoiceId)) {
        const fakeWriteTime = Math.floor(Math.random() * 50) + 20; // 20–70ms
        grouped.set(
          invoiceId,
          new Invoice(
            invoiceId,
            customerName,
            new Date(date),
            [],
            fakeWriteTime // 👈 Tiempo de escritura simulado
          )
        );
      }

      grouped.get(invoiceId)!.items.push({
        id: itemId,
        invoiceId,
        productName,
        quantity,
        unitPrice: Number(unitPrice),
      });
    }

    return Array.from(grouped.values());
  }
}
