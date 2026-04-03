import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Package, Edit, Trash2, AlertCircle, X, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://192.168.3.4:8080/api/inventory/products');
      if (response.ok) {
        setProducts(await response.json());
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EDIT LOGIC
  // ==========================================
  const openEditModal = (product) => {
    setSelectedProduct({ ...product }); // Copy the product data into state
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://192.168.3.4:8080/api/inventory/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-PIN': sessionStorage.getItem('adminPIN') // <-- ADD THIS LINE!
        },
        body: JSON.stringify({
          ...selectedProduct,
          price: parseFloat(selectedProduct.price),
          stockQuantity: parseInt(selectedProduct.stockQuantity)
        })
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Product updated successfully!' });
        setIsEditModalOpen(false);
        fetchProducts(); // Refresh the table
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update product.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  // ==========================================
  // DELETE LOGIC
  // ==========================================
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://192.168.3.4:8080/api/inventory/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-PIN': sessionStorage.getItem('adminPIN') // <-- ADD THIS LINE!
        }
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Product deleted.' });
        setIsDeleteModalOpen(false);
        fetchProducts(); // Refresh the table
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        const errorText = await response.text();
        setStatus({ type: 'error', message: errorText || 'Failed to delete.' });
        setIsDeleteModalOpen(false);
        setTimeout(() => setStatus({ type: '', message: '' }), 5000);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Cannot connect to server.' });
      setIsDeleteModalOpen(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12 font-sans text-gray-900 dark:text-gray-100 relative transition-colors duration-200">
      
      {/* Toast Notification */}
      {status.message && (
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

      {/* ==========================================
          EDIT MODAL
          ========================================== */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Product</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={submitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input type="text" name="name" value={selectedProduct.name} onChange={handleEditChange} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 dark:text-white transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (Ksh)</label>
                  <input type="number" name="price" value={selectedProduct.price} onChange={handleEditChange} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 dark:text-white transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Level</label>
                  <input type="number" name="stockQuantity" value={selectedProduct.stockQuantity} onChange={handleEditChange} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 dark:text-white transition-colors" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE CONFIRMATION MODAL
          ========================================== */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Product?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Are you sure you want to permanently delete <span className="font-bold text-gray-900 dark:text-white">{selectedProduct.name}</span>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Search */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Stock List</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view your current inventory levels.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} strokeWidth={1.5} />
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all shadow-sm dark:text-white dark:placeholder-gray-500" />
          </div>
        </div>
      </div>

      {/* The Data Table */}
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400">
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Level</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-gray-500 dark:text-gray-400">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="5" className="py-12 text-center text-gray-500 dark:text-gray-400"><Package className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={32} />No products found.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300"><span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors">{product.category}</span></td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-medium">Ksh {product.price.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      {product.stockQuantity <= 5 ? (
                        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-lg w-max text-sm font-medium transition-colors"><AlertCircle size={14} strokeWidth={2} />{product.stockQuantity} Left</div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900 dark:text-white px-3 py-1">{product.stockQuantity} in stock</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* THE NEW ONCLICK EVENTS */}
                        <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit size={16} strokeWidth={2} /></button>
                        <button onClick={() => openDeleteModal(product)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={16} strokeWidth={2} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;