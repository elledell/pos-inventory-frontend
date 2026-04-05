import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CheckCircle, AlertCircle, Banknote, Smartphone, Edit2, Wrench, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchInventory();
    sessionStorage.removeItem('adminPIN');
  }, []);

  const fetchInventory = async () => {
    try {
      const [prodRes, servRes] = await Promise.all([
        fetch('https://pos-inventory-backend-vmlq.onrender.com/api/inventory/products'),
        fetch('https://pos-inventory-backend-vmlq.onrender.com/api/inventory/services')
      ]);
      
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.filter(p => p.stockQuantity > 0));
      }
      if (servRes.ok) {
        setServices(await servRes.json());
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const addToCart = (item, isService = false) => {
    setCart(prevCart => {
      const cartId = isService ? `srv_${item.id}` : `prd_${item.id}`;
      const existingItem = prevCart.find(cartItem => cartItem.cartId === cartId);
      
      if (existingItem) {
        if (!isService && existingItem.cartQuantity >= item.stockQuantity) {
            setStatus({ type: 'error', message: 'Cannot exceed available stock!' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
            return prevCart;
        }
        return prevCart.map(cartItem => 
          cartItem.cartId === cartId ? { ...cartItem, cartQuantity: cartItem.cartQuantity + 1 } : cartItem
        );
      }
      
      return [...prevCart, { 
        ...item, 
        cartId, 
        isService, 
        cartQuantity: 1, 
        sellingPrice: item.price 
      }];
    });
  };

  const updateQuantity = (cartId, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.cartId === cartId) {
        const newQuantity = item.cartQuantity + delta;
        if (newQuantity > 0 && (item.isService || newQuantity <= item.stockQuantity)) {
          return { ...item, cartQuantity: newQuantity };
        }
      }
      return item;
    }));
  };

  const updatePrice = (cartId, newPrice) => {
    setCart(prevCart => prevCart.map(item => 
      item.cartId === cartId ? { ...item, sellingPrice: Number(newPrice) || 0 } : item
    ));
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.cartQuantity), 0);
  
  const displayItems = activeTab === 'products' 
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setStatus({ type: 'loading', message: 'Processing sale...' });

    const salePayload = {
      paymentMethod: paymentMethod,
      products: cart.filter(item => !item.isService).map(item => ({
        productId: item.id,
        quantitySold: item.cartQuantity,
        sellingPrice: item.sellingPrice
      })),
      services: cart.filter(item => item.isService).map(item => ({
        serviceId: item.id,
        customPrice: item.sellingPrice * item.cartQuantity
      }))
    };

    try {
      const response = await fetch('https://pos-inventory-backend-vmlq.onrender.com/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salePayload)
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Sale completed successfully!' });
        setCart([]); 
        fetchInventory(); 
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        setStatus({ type: 'error', message: 'Checkout failed. Please try again.' });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Cannot connect to server.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans text-gray-900 dark:text-gray-100 relative transition-colors duration-200">
      
      {status.message && status.type !== 'loading' && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all ${
          status.type === 'success' ? 'bg-white dark:bg-gray-800 border-green-100 dark:border-green-900/50 text-gray-800 dark:text-white' : 'bg-white dark:bg-gray-800 border-red-100 dark:border-red-900/50 text-gray-800 dark:text-white'
        }`}>
          {status.type === 'success' ? <CheckCircle className="text-green-500" size={24} /> : <AlertCircle className="text-red-500" size={24} />}
          <div className="flex flex-col">
            <span className="font-bold text-sm">{status.type === 'success' ? 'Success' : 'Error'}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{status.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Point of Sale</h2>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: CATALOG */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[calc(100vh-140px)] transition-colors duration-200">
          
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl mb-4 w-fit transition-colors">
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <Package size={16} /> Physical Stock
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <Wrench size={16} /> Repairs & Services
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} strokeWidth={1.5} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all dark:placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {displayItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item, activeTab === 'services')}
                  className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all group active:scale-95 bg-white dark:bg-gray-800 flex flex-col"
                >
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                    {activeTab === 'products' ? item.category : 'Service'}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.name}</h3>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-bold text-gray-900 dark:text-white">Ksh {item.price}</span>
                    {activeTab === 'products' ? (
                      <span className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.stockQuantity} left
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        Add to cart
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE CART */}
        <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[calc(100vh-140px)] transition-colors duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart size={20} /> Current Order
            </h3>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
              {cart.length} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-3">
                <ShoppingCart size={48} strokeWidth={1} />
                <p>Your cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.cartId} className="flex flex-col py-3 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="pr-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {item.isService ? <Wrench size={14} className="text-blue-500 dark:text-blue-400"/> : <Package size={14} className="text-gray-400 dark:text-gray-500"/>}
                        {item.name}
                      </h4>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ksh</span>
                      <input 
                        type="number" 
                        value={item.sellingPrice}
                        onChange={(e) => updatePrice(item.cartId, e.target.value)}
                        className="w-16 bg-transparent text-sm font-semibold text-gray-900 dark:text-white outline-none"
                      />
                      <Edit2 size={12} className="text-gray-400 dark:text-gray-500" />
                    </div>

                    <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">{item.cartQuantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl">
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'Cash' ? 'bg-white dark:bg-gray-700 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white shadow-sm' : 'bg-transparent border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                <Banknote size={18} /> Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('M-Pesa')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'M-Pesa' ? 'bg-white dark:bg-gray-700 border-2 border-green-600 dark:border-green-500 text-green-700 dark:text-green-400 shadow-sm' : 'bg-transparent border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                <Smartphone size={18} /> M-Pesa
              </button>
            </div>

            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Total:</span>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">Ksh {cartTotal.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || status.type === 'loading'}
              className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 focus:ring-4 focus:ring-gray-200 dark:focus:ring-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {status.type === 'loading' ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;