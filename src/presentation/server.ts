import Fastify from "fastify";
import { Database } from "../infrastructure/db/data-source";
import { InvoiceRepo } from "../infrastructure/repos/InvoiceRepo";
import { InvoiceItemRepo } from "../infrastructure/repos/InvoiceItemRepo";
import { CreateInvoiceUseCase } from "../core/usecases/CreateInvoiceUseCase";
import { GetInvoiceUseCase } from "../core/usecases/GetInvoiceUseCase";
import { ListInvoicesUseCase } from "../core/usecases/ListInvoicesUseCase";
import { invoiceRoutes } from "./controllers/InvoiceController";
import { config } from "../shared/config";

async function bootstrap() {
    // 1. Inicializar conexión a la BD
    const dataSource = await Database.getInstance();

    // 2. Instanciar repositorios e inyectarlos en los Use Cases
    const invoiceRepo = new InvoiceRepo(dataSource);
    const invoiceItemRepo = new InvoiceItemRepo(dataSource);

    const createInvoice = new CreateInvoiceUseCase(invoiceRepo);
    const getInvoice = new GetInvoiceUseCase(invoiceRepo);
    const listInvoices = new ListInvoicesUseCase(invoiceRepo);

    // 3. Crear servidor Fastify
    const server = Fastify({ logger: true });

    // 4. Registrar rutas (pasando use cases como opciones)
    server.register(invoiceRoutes, {
        createInvoice,
        getInvoice,
        listInvoices,
    });

    // 5. Arrancar
    try {
        await server.listen({ port: config.SERVER_PORT });
        console.log(`Server listening on http://localhost:${config.SERVER_PORT}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

bootstrap();
