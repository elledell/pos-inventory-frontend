import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Wrench, Clock, Banknote, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const DailySales = () => {
  const [salesData, setSalesData] = useState({ products: [], services: [], totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  useEffect(() => {
    fetchTodaySales();
  }, []);

  const fetchTodaySales = async () => {
    try {
      const response = await fetch('https://pos-inventory-backend-vmlq.onrender.com/api/reports/sales/today');
      if (response.ok) {
        const rawSales = await response.json();
        
        let total = 0;
        let prods = [];
        let servs = [];

        rawSales.forEach(sale => {
          total += sale.totalAmount;
          
          const timeString = new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if(sale.items) {
              sale.items.forEach(item => {
                const formattedItem = {
                  id: item.id,
                  name: item.itemName,
                  quantity: item.quantity,
                  pricePerUnit: item.unitPrice,
                  total: item.subTotal,
                  time: timeString
                };

                if (item.itemType === 'PRODUCT') {
                  prods.push(formattedItem);
                } else if (item.itemType === 'SERVICE') {
                  servs.push(formattedItem);
                }
              });
          }
        });

        setSalesData({ products: prods, services: servs, totalRevenue: total });
      }
    } catch (error) {
      console.error("Failed to fetch today's sales:", error);
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
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Today's Sales Ledger</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <Calendar size={16} /> {today}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Banknote size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : `Ksh ${salesData.totalRevenue.toLocaleString()}`}
              </p>
            </div>
          </div>
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
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <p className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Loading ledger...</p>
            ) : salesData.products.length === 0 ? (
              <p className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No products sold yet today.</p>
            ) : (
              salesData.products.map((item, index) => (
                <div key={index} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {item.time} &bull; {item.quantity} x Ksh {item.pricePerUnit}
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-fit transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
            <Wrench className="text-orange-500 dark:text-orange-400" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Services Rendered</h3>
            <span className="ml-auto bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full">
              {salesData.services.length} Jobs
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
               <p className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Loading ledger...</p>
            ) : salesData.services.length === 0 ? (
              <p className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No services rendered yet today.</p>
            ) : (
              salesData.services.map((service, index) => (
                <div key={index} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {service.time}
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
    </div>
  );
};

export default DailySales;