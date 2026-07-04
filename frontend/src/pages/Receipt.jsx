const Receipt = ({ sale, onNewSale }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 print:shadow-none print:border-none">
        <div className="text-center mb-4">
          <span className="text-3xl">💊</span>
          <h2 className="text-lg font-bold text-gray-800 mt-1">PharmaSys Receipt</h2>
          <p className="text-xs text-gray-500">{sale.receiptNumber}</p>
          <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleString()}</p>
        </div>

        <div className="text-sm text-gray-600 mb-4 flex justify-between">
          <span>Customer</span>
          <span className="font-medium text-gray-800">{sale.customerName}</span>
        </div>

        <div className="border-t border-dashed pt-3 space-y-2 mb-4">
          {sale.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <div>
                <p className="text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.quantity} x ₹{item.price.toFixed(2)}
                </p>
              </div>
              <span className="text-gray-800 font-medium">₹{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{sale.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Discount</span>
            <span>-₹{sale.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({(sale.taxRate * 100).toFixed(0)}%)</span>
            <span>₹{sale.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-800 border-t pt-2 mt-2">
            <span>Total Paid</span>
            <span>₹{sale.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 text-center pt-2 uppercase">{sale.paymentMethod}</p>
        </div>

        <div className="flex gap-3 mt-6 print:hidden">
          <button onClick={() => window.print()} className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg text-sm font-medium">
            Print
          </button>
          <button onClick={onNewSale} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium">
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
