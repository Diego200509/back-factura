import { FastifyInstance } from "fastify";
import { CreateInvoiceUseCase } from "../../core/usecases/CreateInvoiceUseCase";
import { GetInvoiceUseCase } from "../../core/usecases/GetInvoiceUseCase";
import { ListInvoicesUseCase } from "../../core/usecases/ListInvoicesUseCase";
import { BulkInsertItemsUseCase } from "../../core/usecases/BulkInsertItemsUseCase";

interface InvoiceRoutesOpts {
  createInvoice: CreateInvoiceUseCase;
  getInvoice: GetInvoiceUseCase;
  listInvoices: ListInvoicesUseCase;
  bulkInsertItems: BulkInsertItemsUseCase;
}

/**
 * Plugin Fastify para facturas
 */
export function invoiceRoutes(
  fastify: FastifyInstance,
  opts: InvoiceRoutesOpts,
  done: () => void
) {
  const { createInvoice, getInvoice, listInvoices, bulkInsertItems } = opts;

  // Crear factura (maestro + detalle)
  fastify.post<{
    Body: {
      customerName: string;
      date: string; // ISO
      items: { productName: string; quantity: number; unitPrice: number }[];
    };
  }>("/invoices", async (request, reply) => {
    const { customerName, date, items } = request.body;
    const invoice = await createInvoice.execute({
      customerName,
      date: new Date(date),
      items,
    });
    reply.code(201).send(invoice);
  });

  // Obtener factura por ID
  fastify.get<{
    Params: { id: string };
  }>("/invoices/:id", async (request, reply) => {
    const { id } = request.params;
    const invoice = await getInvoice.execute(id);
    if (!invoice) {
      return reply.code(404).send({ message: "Invoice not found" });
    }
    return reply.send(invoice);
  });

  // Listar todas
  fastify.get("/invoices", async (_request, reply) => {
    const all = await listInvoices.execute();
    return reply.send(all);
  });

  // Bulk‐load de ítems (detalle)
  fastify.post<{
    Body: {
      invoiceId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }[];
  }>("/invoice-items/bulk", async (request, reply) => {
    const count = await bulkInsertItems.execute(request.body);
    reply.code(201).send({ inserted: count });
  });

  done();
}
