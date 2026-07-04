const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');

const getMedicines = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let filter = {};
  if (search) {
    filter = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ],
    };
  }
  const medicines = await Medicine.find(filter).sort({ createdAt: -1 });
  res.json(medicines);
});

const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  res.json(medicine);
});

const createMedicine = asyncHandler(async (req, res) => {
  const { name, batchNumber, category, manufacturer, supplier, expiryDate, stockQuantity, reorderLevel, price, costPrice } = req.body;

  if (!name || !batchNumber || !supplier || !expiryDate || price === undefined) {
    res.status(400);
    throw new Error('Please provide all required medicine fields');
  }

  const existing = await Medicine.findOne({ batchNumber });
  if (existing) {
    res.status(400);
    throw new Error('A medicine with this batch number already exists');
  }

  const medicine = await Medicine.create({
    name,
    batchNumber,
    category,
    manufacturer,
    supplier,
    expiryDate,
    stockQuantity: stockQuantity || 0,
    reorderLevel: reorderLevel || 20,
    price,
    costPrice: costPrice || 0,
    createdBy: req.user._id,
  });

  res.status(201).json(medicine);
});

const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  const fields = ['name', 'batchNumber', 'category', 'manufacturer', 'supplier', 'expiryDate', 'stockQuantity', 'reorderLevel', 'price', 'costPrice'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      medicine[field] = req.body[field];
    }
  });

  const updated = await medicine.save();
  res.json(updated);
});

const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  await medicine.deleteOne();
  res.json({ message: 'Medicine removed successfully' });
});

const getLowStock = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find();
  const lowStock = medicines.filter((m) => m.stockQuantity <= m.reorderLevel);
  res.json(lowStock);
});

module.exports = { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine, getLowStock };
