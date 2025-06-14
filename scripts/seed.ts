import { faker } from "@faker-js/faker";
import { Database } from "../src/infrastructure/db/data-source";
import { CustomerEntity } from "../src/infrastructure/db/entities/CustomerEntity";
import { ProductEntity } from "../src/infrastructure/db/entities/ProductEntity";
import { DataSource } from "typeorm";

const TOTAL = 5000;
const BATCH = 500;
const TOTAL_CUSTOMERS = 100;
const TOTAL_PRODUCTS = 50;

async function seed() {
  const ds: DataSource = await Database.getInstance();
  const customerRepo = ds.getRepository(CustomerEntity);
  const productRepo = ds.getRepository(ProductEntity);

  // 1. Insertar clientes
  console.log("📥 Insertando clientes...");
  const customers = Array.from({ length: TOTAL_CUSTOMERS }, () =>
    customerRepo.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
    })
  );
  await customerRepo.save(customers);

  // 2. Insertar productos
  console.log("📥 Insertando productos...");
  const products = Array.from({ length: TOTAL_PRODUCTS }, () =>
    productRepo.create({
      name: faker.commerce.productName(),
      price: Number(faker.commerce.price({ min: 5, max: 200 })),
    })
  );
  await productRepo.save(products);

  // 3. Insertar facturas usando procedimiento almacenado
  console.log(`🚀 Insertando ${TOTAL} facturas con procedimiento almacenado...`);

  for (let offset = 0; offset < TOTAL; offset += BATCH) {
    for (let i = 0; i < BATCH; i++) {
      const customer = faker.helpers.arrayElement(customers);

      const items = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => {
        const product = faker.helpers.arrayElement(products);
        return {
          productName: product.name,
          quantity: faker.number.int({ min: 1, max: 20 }),
          unitPrice: product.price,
        };
      });

      const itemsJson = JSON.stringify(items);

      await ds.query(`CALL InsertInvoiceWithItems(?, ?, ?);`, [
        customer.name,
        faker.date.past({ years: 1 }),
        itemsJson,
      ]);
    }

    console.log(`✅ Seeded ${Math.min(offset + BATCH, TOTAL)}/${TOTAL} facturas`);
  }

  console.log("🎉 Seed completo.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
