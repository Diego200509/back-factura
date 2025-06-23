import { InvoiceItem } from "./InvoiceItem";

export class Invoice {
  constructor(
    public id: string,
    public customerName: string,
    public date: Date,
    public items: InvoiceItem[],
    public writeTimeMs?: number // ✅ NUEVA propiedad opcional
  ) {}
}
