const asyncHandler = require('express-async-handler');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');

const generateReceiptNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCPT-${timestamp}-${random}`;
};

const createSale = asyncHandler(async (req, res) => {
  const { items, taxRate, discount, paymentMethod, customerName } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Sale must include at least one item');
  }

  const resolvedItems = [];

  // First pass: validate every item and lock in the medicine documents
  for (const item of items) {
    const medicine = await Medicine.findById(item.medicineId);
    if (!medicine) {
      res.status(404);
      throw new Error(`Medicine not found: ${item.medicineId}`);
    }
    if (!item.quantity || item.quantity < 1) {
      res.status(400);
      throw new Error(`Invalid quantity for ${medicine.name}`);
    }
    if (medicine.stockQuantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}`);
    }
    resolvedItems.push({ medicine, quantity: item.quantity });
  }

  // Second pass: deduct stock and build sale line items
  let subtotal = 0;
  const saleItems = [];

  for (const { medicine, quantity } of resolvedItems) {
    medicine.stockQuantity -= quantity;
    await medicine.save();

    const itemSubtotal = medicine.price * quantity;
    subtotal += itemSubtotal;

    saleItems.push({
      medicine: medicine._id,
      name: medicine.name,
      batchNumber: medicine.batchNumber,
      quantity,
      price: medicine.price,
      subtotal: itemSubtotal,
    });
  }

  const finalTaxRate = taxRate !== undefined ? taxRate : 0.05;
  const finalDiscount = discount || 0;
  const taxAmount = (subtotal - finalDiscount) * finalTaxRate;
  const total = subtotal - finalDiscount + taxAmount;

  const sale = await Sale.create({
    receiptNumber: generateReceiptNumber(),
    items: saleItems,
    subtotal,
    taxRate: finalTaxRate,
    taxAmount,
    discount: finalDiscount,
    total,
    paymentMethod: paymentMethod || 'cash',
    cashier: req.user._id,
    customerName: customerName || 'Walk-in Customer',
  });

  res.status(201).json(sale);
});

const getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find().populate('cashier', 'name email').sort({ createdAt: -1 });
  res.json(sales);
});

const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate('cashier', 'name email');
  if (!sale) {
    res.status(404);
    throw new Error('Sale not found');
  }
  res.json(sale);
});

module.exports = { createSale, getSales, getSaleById };
