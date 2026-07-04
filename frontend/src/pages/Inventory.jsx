import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '',
  batchNumber: '',
  category: '',
  manufacturer: '',
  supplier: '',
  expiryDate: '',
  stockQuantity: 0,
  reorderLevel: 20,
  price: 0,
  costPrice: 0,
};

const Inventory = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const canManage = user.role === 'admin' || user.role === 'pharmacist';
  const canDelete = user.role === 'admin';

  const fetchMedicines = async (searchTerm = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/medicines', { params: searchTerm ? { search: searchTerm } : {} });
      setMedicines(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(search);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: ['stockQuantity', 'reorderLevel', 'price', 'costPrice'].includes(name) ? Number(value) : value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/medicines/${editingId}`, form);
      } else {
        await api.post('/medicines', form);
      }
      resetForm();
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medicine');
    }
  };

  const handleEdit = (medicine) => {
    setForm({
      name: medicine.name,
      batchNumber: medicine.batchNumber,
      category: medicine.category || '',
      manufacturer: medicine.manufacturer || '',
      supplier: medicine.supplier,
      expiryDate: medicine.expiryDate ? medicine.expiryDate.substring(0, 10) : '',
      stockQuantity: medicine.stockQuantity,
      reorderLevel: medicine.reorderLevel,
      price: medicine.price,
      costPrice: medicine.costPrice || 0,
    });
    setEditingId(medicine._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await api.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medicine');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        {canManage && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showForm ? 'Close Form' : '+ Add Medicine'}
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

      {showForm && canManage && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input name="name" required value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
            <input name="batchNumber" required value={form.batchNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
            <input name="manufacturer" value={form.manufacturer} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input name="supplier" required value={form.supplier} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input type="date" name="expiryDate" required value={form.expiryDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input type="number" min="0" name="stockQuantity" required value={form.stockQuantity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
            <input type="number" min="0" name="reorderLevel" value={form.reorderLevel} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
            <input type="number" min="0" step="0.01" name="price" required value={form.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₹)</label>
            <input type="number" min="0" step="0.01" name="costPrice" value={form.costPrice} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
              {editingId ? 'Update Medicine' : 'Save Medicine'}
            </button>
          </div>
        </form>
      )}

      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, batch number, or supplier..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
        />
        <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Search
        </button>
      </form>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Batch No.</th>
              <th className="px-4 py-3 text-left">Supplier</th>
              <th className="px-4 py-3 text-left">Expiry</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Price (₹)</th>
              {canManage && <th className="px-4 py-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">Loading...</td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">No medicines found</td>
              </tr>
            ) : (
              medicines.map((m) => {
                const isLow = m.stockQuantity <= m.reorderLevel;
                const isExpired = new Date(m.expiryDate) < new Date();
                return (
                  <tr key={m._id} className={isLow ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600">{m.batchNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{m.supplier}</td>
                    <td className={`px-4 py-3 ${isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                      {new Date(m.expiryDate).toLocaleDateString()}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                      {m.stockQuantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">{m.price.toFixed(2)}</td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(m)} className="text-primary-600 hover:underline text-xs font-medium">
                            Edit
                          </button>
                          {canDelete && (
                            <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:underline text-xs font-medium">
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
