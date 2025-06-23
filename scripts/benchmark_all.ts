import { Database } from "../src/infrastructure/db/data-source";
import { InvoiceRepo } from "../src/infrastructure/repos/InvoiceRepo";

const LOTES_REPORTE = [100, 1000, 4000, 10000, 20000, 60000, 100000, 1000000];

async function main() {
  const ds = await Database.getInstance();
  const invoiceRepo = new InvoiceRepo(ds);

  console.log("🔎 Benchmark por orden (1 a 15 ítems)");

  const ids = await ds.query(`
    SELECT invoiceId AS id
    FROM invoice_items
    GROUP BY invoiceId
    HAVING COUNT(*) BETWEEN 1 AND 15
    ORDER BY COUNT(*) ASC
    LIMIT 15
  `);

  for (const [i, { id }] of ids.entries()) {
    const label = `🧾 Lectura orden ${i + 1} con ${i + 1} ítem(s)`;
    console.time(label);
    await invoiceRepo.findById(id);
    console.timeEnd(label);
  }

  console.log("\n📊 Benchmark del reporte Maestro/Detalle");

  for (const cantidad of LOTES_REPORTE) {
    const label = `📖 Reporte de ${cantidad.toLocaleString()} órdenes`;
    console.time(label);

  await ds.query(`
  SELECT 
    i.id AS invoiceId,
    i.customerName,
    i.date,
    it.id AS itemId,
    it.productName,
    it.quantity,
    it.unitPrice
  FROM invoices i
  JOIN invoice_items it ON it.invoiceId = i.id
  WHERE i.date <= (
    SELECT date FROM invoices ORDER BY date ASC LIMIT 1 OFFSET ?
  )
  ORDER BY i.date ASC
  LIMIT ?
`, [cantidad - 1, cantidad]);


    console.timeEnd(label);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error en benchmark:", err);
  process.exit(1);
});
