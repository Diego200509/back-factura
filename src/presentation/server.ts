import Fastify from "fastify";
import { Database } from "../infrastructure/db/data-source";
import { InvoiceRepo } from "../infrastructure/repos/InvoiceRepo";
import { InvoiceItemRepo } from "../infrastructure/repos/InvoiceItemRepo";
import { CreateInvoiceUseCase } from "../core/usecases/CreateInvoiceUseCase";
import { GetInvoiceUseCase } from "../core/usecases/GetInvoiceUseCase";
import { ListInvoicesUseCase } from "../core/usecases/ListInvoicesUseCase";
import { BulkInsertItemsUseCase } from "../core/usecases/BulkInsertItemsUseCase";
import { invoiceRoutes } from "./controllers/InvoiceController";
import { config } from "../shared/config";

async function bootstrap() {
  const dataSource = await Database.getInstance();

  // 2. Instanciar repositorios
  const invoiceRepo     = new InvoiceRepo(dataSource);
  const invoiceItemRepo = new InvoiceItemRepo(dataSource);

  // 3. Instanciar use cases
  const createInvoice    = new CreateInvoiceUseCase(invoiceRepo);
  const getInvoice       = new GetInvoiceUseCase(invoiceRepo);
  const listInvoices     = new ListInvoicesUseCase(invoiceRepo);
  const bulkInsertItems  = new BulkInsertItemsUseCase(invoiceItemRepo);

  // 4. Crear servidor Fastify
  const server = Fastify({ logger: true });

  // 5. Registrar rutas (agregamos bulkInsertItems)
  server.register(invoiceRoutes, {
    createInvoice,
    getInvoice,
    listInvoices,
    bulkInsertItems,
  });

  // 6. Arrancar
  try {
    await server.listen({ port: config.SERVER_PORT });
    console.log(`Server listening on http://localhost:${config.SERVER_PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

bootstrap();
