import { useEffect, useState } from 'react';
import api from '../api/axios';
import LowStockAlert from '../components/LowStockAlert';

const StatCard = ({ label, value, icon, accent }) => (
  <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`text-3xl ${accent}`}>{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Medicines" value={summary.totalMedicines} icon="📦" accent="text-primary-600" />
        <StatCard label="Low Stock Items" value={summary.lowStockCount} icon="⚠" accent="text-amber-500" />
        <StatCard
          label="Total Sales Today"
          value={`₹${summary.totalSalesToday.toFixed(2)}`}
          icon="💰"
          accent="text-green-600"
        />
        <StatCard label="Transactions Today" value={summary.totalTransactionsToday} icon="🧾" accent="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlert items={summary.lowStockItems} />

        <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Inventory Overview</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Total Inventory Value</span>
              <span className="font-semibold text-gray-800">₹{summary.totalInventoryValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Expired Medicines</span>
              <span className="font-semibold text-red-600">{summary.expiredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Low Stock Threshold Alerts</span>
              <span className="font-semibold text-amber-600">{summary.lowStockCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
