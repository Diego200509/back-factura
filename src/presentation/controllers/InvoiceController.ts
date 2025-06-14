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
  const {
    createInvoice,
    getInvoice,
    listInvoices,
    bulkInsertItems,
  } = opts;

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

  // Listar facturas con paginación y filtro por cliente
  fastify.get<{
    Querystring: {
      page?: string;
      pageSize?: string;
      customerName?: string;
    };
  }>("/invoices", async (request, reply) => {
    const {
      page = "1",
      pageSize = "20",
      customerName,
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const sizeNum = Math.min(100, parseInt(pageSize, 10) || 20);

    const invoices = await listInvoices.execute({
      page: pageNum,
      pageSize: sizeNum,
      customerName,
    });

    reply.send(invoices);
  });

  // Bulk-load de ítems (detalle)
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
