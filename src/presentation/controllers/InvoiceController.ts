import { FastifyInstance } from "fastify";
import { DataSource } from "typeorm";

import { CreateInvoiceUseCase } from "../../core/usecases/CreateInvoiceUseCase";
import { GetInvoiceUseCase } from "../../core/usecases/GetInvoiceUseCase";
import { ListInvoicesUseCase } from "../../core/usecases/ListInvoicesUseCase";
import { BulkInsertItemsUseCase } from "../../core/usecases/BulkInsertItemsUseCase";

import { CustomerEntity } from "../../infrastructure/db/entities/CustomerEntity";
import { ProductEntity } from "../../infrastructure/db/entities/ProductEntity";

interface InvoiceRoutesOpts {
  createInvoice: CreateInvoiceUseCase;
  getInvoice: GetInvoiceUseCase;
  listInvoices: ListInvoicesUseCase;
  bulkInsertItems: BulkInsertItemsUseCase;
}

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

  const dataSource = require("../../infrastructure/db/data-source").Database;

  // Crear factura
  fastify.post<{
    Body: {
      customerName: string;
      date: string;
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

  // Listar facturas
  fastify.get<{
    Querystring: {
      page?: string;
      pageSize?: string;
      limit?: string;
      customerName?: string;
    };
  }>("/invoices", async (request, reply) => {
    const {
      page = "1",
      pageSize = "20",
      customerName,
      limit,
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const sizeNum = limit ? parseInt(limit, 10) : parseInt(pageSize, 10) || 20;

    const invoices = await listInvoices.execute({
      page: pageNum,
      pageSize: sizeNum,
      customerName,
    });

    reply.send(invoices);
  });

  // Bulk-insert de ítems
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

  // Obtener clientes
  fastify.get("/customers", async (_, reply) => {
    const ds: DataSource = await dataSource.getInstance();
    const repo = ds.getRepository(CustomerEntity);
    const customers = await repo.find();
    reply.send(customers);
  });

  // Obtener productos
  fastify.get("/products", async (_, reply) => {
    const ds: DataSource = await dataSource.getInstance();
    const repo = ds.getRepository(ProductEntity);
    const products = await repo.find();
    reply.send(products);
  });

  done();
}
