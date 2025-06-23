import { DataSource } from "typeorm";
import { Database } from "../src/infrastructure/db/data-source";

async function clean() {
  const ds: DataSource = await Database.getInstance();
  console.log("🧹 Limpiando tablas...");

  await ds.query("SET foreign_key_checks = 0");
  await ds.query("TRUNCATE TABLE invoice_items");
  await ds.query("TRUNCATE TABLE invoices");
  await ds.query("TRUNCATE TABLE customers");
  await ds.query("TRUNCATE TABLE products");
  await ds.query("SET foreign_key_checks = 1");

  console.log("✅ Tablas limpiadas.");
  process.exit(0);
}

clean().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
