# back-factura

API de facturación con Clean Architecture, Fastify y TypeORM.

## Setup

1. Copia `.env.example` a `.env` y ajusta tus credenciales.  
2. `npm install`  
3. `npm run dev` para desarrollo  
4. `npm run seed` para poblar datos de prueba  

## Scripts

- `seed` — genera y carga datos con Faker  
- `load-test` — ejecuta el benchmark de carga masiva con Artillery  

## Benchmarking con Artillery

Hemos añadido un test de carga que envía batches de ítems a `/invoice-items/bulk` usando un _processor_ de JS y un YAML de configuración:

1. **Processor**  
   - Archivo: `processors.js`  
   - Función `generateItems` crea un array de N ítems (ajustable) y lo expone como `vars.items`.  

2. **YAML**  
   - Archivo: `load-test.yml`  
   - Configura el _target_, fases, headers y escenario:  
     ```yaml
     config:
       target: 'http://127.0.0.1:3000'
       processor: './processors.js'
       phases:
         - duration: 30
           arrivalRate: 20       # peticiones/segundo
       defaults:
         headers:
           Content-Type: application/json

     scenarios:
       - name: Bulk 500 ítems
         flow:
           - function: generateItems
           - post:
               url: /invoice-items/bulk
               json: "{{ items }}"
     ```
   - **CHUNK SIZE**: en `processors.js` puedes ajustar el número de ítems por batch (500, 250, etc.)  

3. **Ejecutar el load-test**  
   ```bash
   npm run dev            # arranca tu API en localhost:3000
   npx artillery run load-test.yml
