const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    name: { type: String, required: true },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, required: true, default: 0.05 },
    taxAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi'], default: 'cash' },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, default: 'Walk-in Customer' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);
