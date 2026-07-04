import { useEffect, useState } from 'react';
import api from '../api/axios';
import Receipt from './Receipt';

const TAX_RATE = 0.05;

const POS = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchMedicines = async (term = '') => {
    const { data } = await api.get('/medicines', { params: term ? { search: term } : {} });
    setMedicines(data.filter((m) => m.stockQuantity > 0));
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(search);
  };

  const addToCart = (medicine) => {
    setError('');
    setCart((prev) => {
      const existing = prev.find((item) => item._id === medicine._id);
      if (existing) {
        if (existing.quantity + 1 > medicine.stockQuantity) {
          setError(`Only ${medicine.stockQuantity} units of ${medicine.name} available`);
          return prev;
        }
        return prev.map((item) => (item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    const medicine = medicines.find((m) => m._id === id);
    if (quantity < 1) return;
    if (medicine && quantity > medicine.stockQuantity) {
      setError(`Only ${medicine.stockQuantity} units available`);
      return;
    }
    setError('');
    setCart((prev) => prev.map((item) => (item._id === id ? { ...item, quantity } : item)));
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + taxAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty. Add medicines before checking out.');
      return;
    }
    setError('');
    setProcessing(true);
    try {
      const { data } = await api.post('/sales', {
        items: cart.map((item) => ({ medicineId: item._id, quantity: item.quantity })),
        taxRate: TAX_RATE,
        discount: Number(discount) || 0,
        paymentMethod,
        customerName: customerName || 'Walk-in Customer',
      });
      setReceipt(data);
      setCart([]);
      setDiscount(0);
      setCustomerName('');
      fetchMedicines(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (receipt) {
    return <Receipt sale={receipt} onNewSale={() => setReceipt(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">POS / Billing</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines to add..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Search
            </button>
          </form>

          <div className="bg-white rounded-xl shadow border border-gray-200 divide-y divide-gray-100 max-h-[32rem] overflow-y-auto">
            {medicines.length === 0 ? (
              <p className="p-4 text-gray-400 text-sm">No medicines available</p>
            ) : (
              medicines.map((m) => (
                <div key={m._id} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-500">
                      Batch: {m.batchNumber} • Stock: {m.stockQuantity} • ₹{m.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(m)}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-3 py-1.5 rounded-lg font-medium"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-5 h-fit">
          <h3 className="font-semibold text-gray-800 mb-4">Cart ({cart.length})</h3>

          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-400">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm border-b pb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                      className="w-14 border border-gray-300 rounded px-2 py-1 text-center"
                    />
                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:underline text-xs">
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer"
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Discount (₹)</label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div className="space-y-1 text-sm border-t pt-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount</span>
              <span>-₹{Number(discount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 border-t pt-2 mt-2">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={processing || cart.length === 0}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg"
          >
            {processing ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
