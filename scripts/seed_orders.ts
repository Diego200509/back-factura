import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";
import { Database } from "../src/infrastructure/db/data-source";

async function seedOrders() {
  const ds = await Database.getInstance();



  for (let i = 1; i <= 15; i++) {
    const invoiceId = randomUUID();
    const customerName = faker.person.fullName();
    const date = faker.date.recent({ days: 30 });

    // ✅ Generar exactamente i ítems
    const items = Array.from({ length: i }, () => [
  randomUUID(),
  invoiceId,
  faker.commerce.productName(),
  faker.number.int({ min: 1, max: 5 }),
  Math.round(faker.number.float({ min: 5, max: 200 }) * 100) / 100
]);

    const label = `🧾 Orden ${i} con ${i} detalle(s)`;
    console.time(label);

    await ds.transaction(async (trx) => {
      await trx.query(
        `INSERT INTO invoices (id, customerName, date) VALUES (?, ?, ?)`,
        [invoiceId, customerName, date]
      );

      const placeholders = items.map(() => `(?, ?, ?, ?, ?)`).join(",");
      await trx.query(
        `INSERT INTO invoice_items (id, invoiceId, productName, quantity, unitPrice) VALUES ${placeholders}`,
        items.flat()
      );
    });

    console.timeEnd(label);
  }

  console.log("✅ 15 órdenes insertadas correctamente.");
  process.exit(0);
}

seedOrders().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
