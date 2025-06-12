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
    // Construye objetos de dominio
    const items = input.items.map(
      (i, idx) =>
        new InvoiceItem(
          "",            
          "",            
          i.productName,
          i.quantity,
          i.unitPrice
        )
    );
    const invoice = new Invoice("", input.customerName, input.date, items);
    // Llama al repositorio
    return this.invoiceRepo.create(invoice);
  }
}
