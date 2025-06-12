import { faker } from "@faker-js/faker";
import { Database } from "../src/infrastructure/db/data-source";
import { InvoiceRepo } from "../src/infrastructure/repos/InvoiceRepo";

const TOTAL = 5000;
const BATCH  = 500;

async function seed() {
  const ds   = await Database.getInstance();
  const repo = new InvoiceRepo(ds);

  console.log(`Iniciando seed de ${TOTAL} facturas en lotes de ${BATCH}...`);

  // 2. Genera en lotes para no consumir demasiado memoria
  for (let offset = 0; offset < TOTAL; offset += BATCH) {
    const batchData = Array.from({ length: BATCH }, () => {
      // Genera entre 3 y 8 ítems aleatorios por factura
      const items = Array.from(
        { length: faker.number.int({ min: 3, max: 8 }) },
        () => ({
          productName: faker.commerce.productName(),
          quantity:    faker.number.int({ min: 1, max: 20 }),
          unitPrice:   Number(faker.commerce.price({ min: 5, max: 200 })),
        })
      );

      return {
        customerName: faker.person.fullName(),
        date:         faker.date.past({ years: 1 }),
        items,
      };
    });

    // 3. Inserta cada lote al UseCase / Repositorio
    await Promise.all(
      batchData.map(f =>
        repo.create({
          id:           "",
          customerName: f.customerName,
          date:         f.date,
          items:        f.items.map(i => ({ id: "", invoiceId: "", ...i })),
        })
      )
    );

    console.log(`Seeded ${Math.min(offset + BATCH, TOTAL)}/${TOTAL} facturas`);
  }

  console.log("Seed completo.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Error en seed:", err);
  process.exit(1);
});
