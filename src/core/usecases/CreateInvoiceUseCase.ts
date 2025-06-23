import { IInvoiceRepo } from "../repos/IInvoiceRepo";
import { Invoice } from "../entities/Invoice";
import { InvoiceItem } from "../entities/InvoiceItem";

export class CreateInvoiceUseCase {
  constructor(private invoiceRepo: IInvoiceRepo) {}

  async execute(input: {
    customerName: string;
    date: Date;
    items: { productName: string; quantity: number; unitPrice: number }[];
  }): Promise<Invoice> {
    const items = input.items.map(
      (i) =>
        new InvoiceItem(
          "",           // id
          "",           // invoiceId
          i.productName,
          i.quantity,
          i.unitPrice
        )
    );

    const invoice = new Invoice("", input.customerName, input.date, items);

    // ⏱️ Medir tiempo de escritura
    const start = performance.now(); // también puedes usar Date.now() si estás en Node.js sin polyfills
    const created = await this.invoiceRepo.create(invoice);
    const end = performance.now();

    // 💾 Guardar el tiempo de escritura en la entidad
    created.writeTimeMs = Math.round(end - start); // opcionalmente redondeado

    return created;
  }
}
