import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CreateInvoiceUseCase } from "../../core/usecases/CreateInvoiceUseCase";
import { GetInvoiceUseCase } from "../../core/usecases/GetInvoiceUseCase";
import { ListInvoicesUseCase } from "../../core/usecases/ListInvoicesUseCase";

interface InvoiceRoutesOpts {
  createInvoice: CreateInvoiceUseCase;
  getInvoice: GetInvoiceUseCase;
  listInvoices: ListInvoicesUseCase;
}

/**
 * Plugin Fastify para facturas
 */
export function invoiceRoutes(
  fastify: FastifyInstance,
  opts: InvoiceRoutesOpts,
  done: () => void
) {
  const { createInvoice, getInvoice, listInvoices } = opts;

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

  done();
}
