import React, { useState, useRef } from 'react';
import { Package, Tag, DollarSign, Layers, AlignLeft, ArrowLeft, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    description: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  
  // 1. Create a reference to our hidden file input
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Standard Single Item Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Adding to database...' });

    try {
      const response = await fetch('http://192.168.3.4:8080/api/inventory/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-PIN': sessionStorage.getItem('adminPIN') // <-- ADD THIS LINE!
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity)
        })
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Item added successfully!' });
        setFormData({ name: '', category: '', price: '', stockQuantity: '', description: '' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        setStatus({ type: 'error', message: 'Failed to add item. Please try again.' });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Cannot connect to server.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    }
  };

  // 3. NEW: Trigger hidden file input
  const handleBulkUploadClick = () => {
    fileInputRef.current.click();
  };

  // 4. NEW: Handle the file once selected
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus({ type: 'loading', message: 'Uploading CSV file...' });

    // Package the file exactly how Postman did it (form-data)
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch('http://192.168.3.4:8080/api/inventory/products/upload', {
        method: 'POST',
        headers: {
          'X-Admin-PIN': sessionStorage.getItem('adminPIN') // <-- ADD THIS LINE!
          // Note: Do NOT add 'Content-Type' here for CSV uploads!
        },
        body: uploadData, // Note: We don't set headers; fetch handles the multipart boundary automatically
      });

      if (response.ok) {
        // Your backend returns a text message like "Successfully uploaded 4 products!"
        const resultText = await response.text(); 
        setStatus({ type: 'success', message: resultText });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
      } else {
        setStatus({ type: 'error', message: 'Failed to upload CSV. Check the file format.' });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Cannot connect to server.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    } finally {
      // Clear the input so you can upload the same file again if needed
      e.target.value = null; 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12 font-sans text-gray-900 dark:text-gray-100 relative transition-colors duration-200">
      
      {/* Toast Notification */}
      {status.message && status.type !== 'loading' && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all transform ${
          status.type === 'success' 
            ? 'bg-white dark:bg-gray-800 border-green-100 dark:border-green-900/50 text-gray-800 dark:text-white' 
            : 'bg-white dark:bg-gray-800 border-red-100 dark:border-red-900/50 text-gray-800 dark:text-white'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="text-green-500" size={24} strokeWidth={2} />
          ) : (
            <AlertCircle className="text-red-500" size={24} strokeWidth={2} />
          )}
          <div className="flex flex-col">
            <span className="font-bold text-sm">{status.type === 'success' ? 'Success' : 'Error'}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{status.message}</span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        
        {/* Updated Bulk Upload Button */}
        <div>
          <button 
            onClick={handleBulkUploadClick}
            disabled={status.type === 'loading'}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <UploadCloud size={18} strokeWidth={1.5} />
            {status.type === 'loading' && status.message.includes('CSV') ? 'Uploading...' : 'Bulk CSV Upload'}
          </button>
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
      </div>

      {/* The Main Form Card */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-200">
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add a New Item</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Enter the product details below to add it to your inventory.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} strokeWidth={1.5} />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Samsung Type-C Charger"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all dark:text-white dark:placeholder-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} strokeWidth={1.5} />
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all appearance-none dark:text-white"
                >
                  <option value="" disabled>Select category</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Audio">Audio</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (Ksh)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} strokeWidth={1.5} />
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Initial Stock</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} strokeWidth={1.5} />
              <input 
                type="number" 
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter quantity"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all dark:text-white dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 text-gray-400 dark:text-gray-500" size={20} strokeWidth={1.5} />
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the product..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all resize-none dark:text-white dark:placeholder-gray-500"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={status.type === 'loading'}
            className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 focus:ring-4 focus:ring-gray-200 dark:focus:ring-blue-900 transition-all disabled:opacity-70"
          >
            {status.type === 'loading' && !status.message.includes('CSV') ? 'Saving...' : 'Add Item'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddItem;