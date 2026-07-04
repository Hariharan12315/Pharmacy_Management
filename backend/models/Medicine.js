const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    batchNumber: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: 'General' },
    manufacturer: { type: String, default: '' },
    supplier: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, default: 20 },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

medicineSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.reorderLevel;
});

medicineSchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
