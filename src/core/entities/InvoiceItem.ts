export class InvoiceItem {
  constructor(
    public readonly id: string,
    public invoiceId: string,
    public productName: string,
    public quantity: number,
    public unitPrice: number
  ) {}
}
