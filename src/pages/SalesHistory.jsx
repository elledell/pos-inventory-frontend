import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Wrench, Clock, Banknote, Calendar, BarChart2, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const SalesHistory = () => {
  const [timeframe, setTimeframe] = useState('weekly'); 
  const [salesData, setSalesData] = useState({ products: [], services: [], totalRevenue: 0 });
  const [paymentBreakdown, setPaymentBreakdown] = useState({ cash: 0, mpesa: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData(timeframe);
  }, [timeframe]);

  const fetchSalesData = async (currentFrame) => {
    setLoading(true);
    try {
      const endpoint = currentFrame === 'weekly' 
        ? 'https://pos-inventory-backend-vmlq.onrender.com/api/reports/sales/weekly'
        : 'https://pos-inventory-backend-vmlq.onrender.com/api/reports/sales/monthly';

      const response = await fetch(endpoint);
      if (response.ok) {
        const rawSales = await response.json();
        
        let total = 0;
        let prods = [];
        let servs = [];
        let cashTotal = 0;
        let mpesaTotal = 0;

        rawSales.forEach(sale => {
          total += sale.totalAmount;
          
          // Accumulate by payment method
          if (sale.paymentMethod === 'Cash') {
            cashTotal += sale.totalAmount;
          } else if (sale.paymentMethod === 'M-Pesa') {
            mpesaTotal += sale.totalAmount;
          }
          
          const dateObj = new Date(sale.saleDate);
          const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if(sale.items) {
              sale.items.forEach(item => {
                const formattedItem = {
                  id: item.id,
                  name: item.itemName,
                  quantity: item.quantity,
                  pricePerUnit: item.unitPrice,
                  total: item.subTotal,
                  timestamp: `${dateString} at ${timeString}`
                };

                if (item.itemType === 'PRODUCT') {
                  prods.push(formattedItem);
                } else if (item.itemType === 'SERVICE') {
                  servs.push(formattedItem);
                }
              });
          }
        });

        prods.reverse();
        servs.reverse();

        setSalesData({ products: prods, services: servs, totalRevenue: total });
        setPaymentBreakdown({ cash: cashTotal, mpesa: mpesaTotal });
      }
    } catch (error) {
      console.error(`Failed to fetch ${currentFrame} sales:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      <div className="max-w-5xl mx-auto mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Sales History</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <BarChart2 size={16} /> Track your long-term performance
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Banknote size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {timeframe === 'weekly' ? 'This Week' : 'This Month'} Total
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : `Ksh ${salesData.totalRevenue.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>

        {/* TIMEFRAME TOGGLE */}
        <div className="mt-6 flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-fit transition-colors">
          <button 
            onClick={() => setTimeframe('weekly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${timeframe === 'weekly' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            This Week
          </button>
          <button 
            onClick={() => setTimeframe('monthly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${timeframe === 'monthly' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            This Month
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PRODUCTS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
            <Package className="text-blue-500 dark:text-blue-400" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Products Sold</h3>
            <span className="ml-auto bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
              {salesData.products.length} Items
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Loading history...</p>
            ) : salesData.products.length === 0 ? (
              <p className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No products sold in this period.</p>
            ) : (
              salesData.products.map((item, index) => (
                <div key={index} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={12} /> {item.timestamp} &bull; {item.quantity} x Ksh {item.pricePerUnit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">Ksh {item.total.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SERVICES */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-fit max-h-[600px] overflow-y-auto transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
            <Wrench className="text-orange-500 dark:text-orange-400" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Services Rendered</h3>
            <span className="ml-auto bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full">
              {salesData.services.length} Jobs
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
               <p className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Loading history...</p>
            ) : salesData.services.length === 0 ? (
              <p className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No services rendered in this period.</p>
            ) : (
              salesData.services.map((service, index) => (
                <div key={index} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={12} /> {service.timestamp}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">Ksh {service.total.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* PAYMENT BREAKDOWN - NEW SECTION */}
      <div className="max-w-5xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method Breakdown</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {timeframe === 'weekly' ? 'This week' : 'This month'}'s revenue split by payment type
            </p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CASH */}
            <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-gray-600 rounded-lg">
                  <Banknote className="text-gray-700 dark:text-gray-300" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cash Payments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? '...' : `Ksh ${paymentBreakdown.cash.toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>

            {/* M-PESA */}
            <div className="flex items-center justify-between p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <Smartphone className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">M-Pesa Payments</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
                    {loading ? '...' : `Ksh ${paymentBreakdown.mpesa.toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SalesHistory;
