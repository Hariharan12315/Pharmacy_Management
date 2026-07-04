const LowStockAlert = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm">
        All medicines are sufficiently stocked.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 bg-amber-50 rounded-t-lg">
        <h3 className="font-semibold text-amber-800">⚠ Low Stock Alerts ({items.length})</h3>
      </div>
      <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
        {items.map((item) => (
          <li key={item._id} className="px-4 py-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-500">Batch: {item.batchNumber}</p>
            </div>
            <span className="text-sm font-semibold text-red-600">{item.stockQuantity} left</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlert;
