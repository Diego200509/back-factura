import { InvoiceItem } from "./InvoiceItem";

export class Invoice {
  constructor(
    public readonly id: string,
    public customerName: string,
    public date: Date,
    public items: InvoiceItem[]
  ) {}
}
