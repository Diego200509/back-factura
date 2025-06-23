import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Database } from '../src/infrastructure/db/data-source';

const BATCH_SIZE = 1000;
const TOTAL_CLIENTES = 100;
const TOTAL_PRODUCTOS = 1000;
const TOTAL_DETALLES = 1000000;

function startTimer(): number {
  return performance.now();
}

function endTimer(start: number, label: string) {
  const end = performance.now();
  const duration = (end - start).toFixed(2);
  const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  console.log(`⏱️ ${label}: ${duration}ms | 🧠 ${memory}MB`);
}

async function insertClientes(ds: DataSource, count: number) {
  const start = startTimer();
  const values: string[] = [];
  const params: any[] = [];

  for (let i = 0; i < count; i++) {
    values.push('(?, ?, ?)');
    params.push(randomUUID(), faker.internet.email(), faker.person.fullName());
  }

  const sql = `INSERT INTO customers (id, email, name) VALUES ${values.join(',')}`;
  await ds.query(sql, params);
  endTimer(start, `Insertados ${count} clientes`);
}

async function insertProductos(ds: DataSource, count: number) {
  const start = startTimer();
  const values: string[] = [];
  const params: any[] = [];

  for (let i = 0; i < count; i++) {
    values.push('(?, ?, ?)');
    params.push(randomUUID(), faker.commerce.productName(), faker.number.float({ min: 5, max: 200 }));
  }

  const sql = `INSERT INTO products (id, name, price) VALUES ${values.join(',')}`;
  await ds.query(sql, params);
  endTimer(start, `Insertados ${count} productos`);
}

async function insertOrdenes(ds: DataSource, totalItems: number) {
  const start = startTimer();

  // 🔧 Desactivar constraints para insertar más rápido
  await ds.query(`SET FOREIGN_KEY_CHECKS = 0`);
  await ds.query(`SET UNIQUE_CHECKS = 0`);
  await ds.query(`SET AUTOCOMMIT = 0`);

  const customers: { id: string, name: string }[] = await ds.query('SELECT id, name FROM customers');
  const products: { id: string; name: string; price: number }[] = await ds.query('SELECT id, name, price FROM products');
  const totalInvoices = Math.ceil(totalItems / 10);

  for (let batch = 0; batch < Math.ceil(totalInvoices / BATCH_SIZE); batch++) {
    await ds.transaction(async (trx) => {
      const invoiceValues: string[] = [];
      const invoiceParams: any[] = [];
      const itemValues: string[] = [];
      const itemParams: any[] = [];

      for (let i = 0; i < BATCH_SIZE && (batch * BATCH_SIZE + i) < totalInvoices; i++) {
        const invoiceId = randomUUID();
        const customer = faker.helpers.arrayElement(customers);
        const date = faker.date.past({ years: 1 });

        invoiceValues.push('(?, ?, ?)');
        invoiceParams.push(invoiceId, customer.name, date); // ✅ Aquí va el nombre real

        const numItems = faker.number.int({ min: 1, max: 20 });
        for (let j = 0; j < numItems && itemParams.length < totalItems * 5; j++) {
          const product = faker.helpers.arrayElement(products);
          itemValues.push('(?, ?, ?, ?, ?)');
          itemParams.push(
            randomUUID(),
            invoiceId,
            product.name,
            faker.number.int({ min: 1, max: 5 }),
            product.price
          );
        }
      }

      await trx.query(`INSERT INTO invoices (id, customerName, date) VALUES ${invoiceValues.join(',')}`, invoiceParams);
      await trx.query(`INSERT INTO invoice_items (id, invoiceId, productName, quantity, unitPrice) VALUES ${itemValues.join(',')}`, itemParams);

      console.log(`✔️ Insertadas ${Math.min((batch + 1) * BATCH_SIZE, totalInvoices)} de ${totalInvoices} facturas`);
    });
  }

  // ✅ Restaurar los checks
  await ds.query(`COMMIT`);
  await ds.query(`SET FOREIGN_KEY_CHECKS = 1`);
  await ds.query(`SET UNIQUE_CHECKS = 1`);
  await ds.query(`SET AUTOCOMMIT = 1`);

  endTimer(start, `Insertadas ${totalInvoices} facturas (~${totalItems} detalles)`);
}

async function run() {
  const ds = await Database.getInstance();
  await insertClientes(ds, TOTAL_CLIENTES);
  await insertProductos(ds, TOTAL_PRODUCTOS);
  await insertOrdenes(ds, TOTAL_DETALLES);
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
