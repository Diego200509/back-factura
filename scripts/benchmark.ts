import { faker } from "@faker-js/faker";
import { Database } from "../src/infrastructure/db/data-source";
import { InvoiceRepo } from "../src/infrastructure/repos/InvoiceRepo";
import { CustomerEntity } from "../src/infrastructure/db/entities/CustomerEntity";
import { ProductEntity } from "../src/infrastructure/db/entities/ProductEntity";

async function benchmark() {
  const ds = await Database.getInstance();
  const invoiceRepo = new InvoiceRepo(ds);
  const customerRepo = ds.getRepository(CustomerEntity);
  const productRepo = ds.getRepository(ProductEntity);

  const customers = await customerRepo.find();
  const products = await productRepo.find();

  console.log("🟦 Medición: inserción de 15 órdenes con 1 a 15 ítems");

  for (let i = 1; i <= 15; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const items = Array.from({ length: i }, () => {
      const product = faker.helpers.arrayElement(products);
      return {
        id: "",
        invoiceId: "",
        productName: product.name,
        quantity: faker.number.int({ min: 1, max: 5 }),
        unitPrice: product.price,
      };
    });

    const label = `🧾 Orden con ${i} ítem(s)`;
    console.time(label);
    await invoiceRepo.create({
      id: "",
      customerName: customer.name,
      date: faker.date.recent({ days: 30 }),
      items,
    });
    console.timeEnd(label);
  }

  // =============================
  // 🟩 MEDICIÓN DE LECTURAS
  // =============================

  const cantidades = [100, 1000, 4000, 10000, 20000, 60000, 100000, 1000000];

  for (const cantidad of cantidades) {
    const label = `📖 Lectura de ${cantidad.toLocaleString()} facturas`;
    console.time(label);
    await invoiceRepo.listAll({ take: cantidad });
    console.timeEnd(label);
  }

  process.exit(0);
}

benchmark().catch((err) => {
  console.error("❌ Error en benchmark:", err);
  process.exit(1);
});
