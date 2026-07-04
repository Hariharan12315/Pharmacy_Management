const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find();
  const totalMedicines = medicines.length;
  const lowStockItems = medicines.filter((m) => m.stockQuantity <= m.reorderLevel);
  const expiredItems = medicines.filter((m) => m.expiryDate < new Date());

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todaySales = await Sale.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
  const totalSalesToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactionsToday = todaySales.length;

  const totalInventoryValue = medicines.reduce((sum, m) => sum + m.price * m.stockQuantity, 0);

  res.json({
    totalMedicines,
    lowStockCount: lowStockItems.length,
    lowStockItems: lowStockItems.slice(0, 10),
    expiredCount: expiredItems.length,
    totalSalesToday,
    totalTransactionsToday,
    totalInventoryValue,
  });
});

module.exports = { getDashboardSummary };
