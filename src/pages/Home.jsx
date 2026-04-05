import React, { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import { LayoutDashboard, PackagePlus, ShoppingCart, Settings, Package, Wrench, AlertCircle, ArrowRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [stats, setStats] = useState({ dailySales: 0, weeklySales: 0, monthlySales: 0 });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Hello');
  
  // State to control the mobile sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Dynamic greeting based on current hour
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good morning');
    } else if (currentHour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await fetch('https://pos-inventory-backend-vmlq.onrender.com/api/reports/dashboard');
      if (statsResponse.ok) setStats(await statsResponse.json());

      const inventoryResponse = await fetch('https://pos-inventory-backend-vmlq.onrender.com/api/inventory/products');
      if (inventoryResponse.ok) {
        const allProducts = await inventoryResponse.json();
        setLowStockItems(allProducts.filter(product => product.stockQuantity <= 5));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-200">
      
      {/* =======================
            MOBILE OVERLAY
          ======================= */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* =======================
            SIDEBAR NAVIGATION
          ======================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50 dark:border-gray-700">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Inventory<span className="text-blue-600 dark:text-blue-400">.sys</span></h1>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl transition-colors">
            <LayoutDashboard size={20} strokeWidth={1.5} />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link to="/add-item" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors">
            <PackagePlus size={20} strokeWidth={1.5} />
            <span className="font-medium text-sm">Add Item</span>
          </Link>
          <Link to="/checkout" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors">
            <ShoppingCart size={20} strokeWidth={1.5} />
            <span className="font-medium text-sm">Point of Sale</span>
          </Link>
          <Link to="/inventory" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors">
            <Package size={20} strokeWidth={1.5} />
            <span className="font-medium text-sm">Stock List</span>
          </Link>
          <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors">
            <Wrench size={20} strokeWidth={1.5} />
            <span className="font-medium text-sm">Services & Repairs</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-50 dark:border-gray-700 space-y-2">
          <ThemeToggle /> 
          
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors">
            <Settings size={20} strokeWidth={1.5} />
            <span className="font-medium text-sm">Settings</span>
          </Link>
        </div>
      </aside>

      {/* =======================
            MAIN CONTENT AREA
          ======================= */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        
        {/* Mobile-Optimized Header */}
        <header className="h-16 flex items-center justify-between md:justify-start px-4 md:px-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 border-b border-gray-100 dark:border-gray-700 z-10 transition-colors duration-200">
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Overview</h2>
        </header>

        <div className="p-5 md:p-10 max-w-6xl mx-auto pb-24">
          
          <div className="mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{greeting}.</h3>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Here is what's happening with your store today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Link to="/daily-sales" className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all block group">
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                Today's Sales <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
              </p>
              <h4 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : `Ksh ${stats.dailySales.toLocaleString()}`}
              </h4>
            </Link>
            
            <Link to="/sales-history" className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all block group">
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                Weekly Revenue <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
              </p>
              <h4 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : `Ksh ${stats.weeklySales.toLocaleString()}`}
              </h4>
            </Link>

            <Link to="/sales-history" className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all block group">
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                Monthly Revenue <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
              </p>
              <h4 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : `Ksh ${stats.monthlySales.toLocaleString()}`}
              </h4>
            </Link>
            
            <Link to="/inventory" className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm hover:border-red-300 dark:hover:border-red-500 transition-all block group bg-red-50/30 dark:bg-red-900/10">
              <p className="text-xs md:text-sm font-medium text-red-500 dark:text-red-400 mb-2 flex items-center justify-between">
                Low Stock Alerts <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
              </p>
              <h4 className="text-2xl lg:text-3xl font-semibold text-red-600 dark:text-red-400">
                {loading ? '...' : `${lowStockItems.length} Items`}
              </h4>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Low Stock List */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-fit transition-colors">
              <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
                <AlertCircle className="text-orange-500" size={18} />
                <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Items Needing Restock</h4>
              </div>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-72 overflow-y-auto">
                {loading ? (
                  <p className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">Checking inventory...</p>
                ) : lowStockItems.length === 0 ? (
                  <p className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">All products are well stocked!</p>
                ) : (
                  lowStockItems.map(item => (
                    <div key={item.id} className="p-4 md:p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="pr-4">
                        <h5 className="text-sm md:text-base font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs md:text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800">
                          {item.stockQuantity} left
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit transition-colors">
              <h4 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-6">Quick Actions</h4>
              <div className="flex flex-col gap-3 md:gap-4">
                <Link to="/checkout" className="text-center px-6 py-3.5 bg-gray-900 dark:bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors shadow-sm">
                  Start New Sale
                </Link>
                <Link to="/add-item" className="text-center px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Add New Product
                </Link>
                <Link to="/inventory" className="text-center px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Manage Inventory
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Home;