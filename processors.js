module.exports = {
  // Esta función se ejecuta antes de cada petición
  generateItems: function (userContext, events, done) {
    // Genera 500 items ligados a tu invoiceId
    const invoiceId = "0006eab9-1049-43f8-b48d-2b85a3801124";
    const items = Array.from({ length: 1000000 }, (_, i) => ({
      invoiceId,
      productName: `Prod ${i + 1}`,
      quantity: 1,
      unitPrice: 10,
    }));
    userContext.vars.items = items;
    return done();
  },
};
