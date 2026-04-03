import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wrench, DollarSign, AlignLeft, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });

  // Fetch services on load
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://192.168.3.4:8080/api/inventory/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Adding service...' });

    try {
      const response = await fetch('http://192.168.3.4:8080/api/inventory/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Service added successfully!' });
        setFormData({ name: '', price: '', description: '' });
        fetchServices(); // Refresh the list instantly!
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        setStatus({ type: 'error', message: 'Failed to add service.' });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Cannot connect to server.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12 font-sans text-gray-900 dark:text-gray-100 relative transition-colors duration-200">
      
      {/* Toast Notification */}
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

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Services & Repairs</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your service offerings like screen replacements and software updates.</p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Add Service Form */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Add New Service</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Name</label>
              <div className="relative">
                <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} strokeWidth={1.5} />
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="e.g. Screen Replacement"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all text-sm dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Standard Price (Ksh)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} strokeWidth={1.5} />
                <input 
                  type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01"
                  placeholder="0.00"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all text-sm dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-3 text-gray-400 dark:text-gray-500" size={18} strokeWidth={1.5} />
                <textarea 
                  name="description" value={formData.description} onChange={handleChange} rows="3"
                  placeholder="Describe the repair..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 rounded-xl outline-none transition-all resize-none text-sm dark:text-white dark:placeholder-gray-500"
                ></textarea>
              </div>
            </div>

            <button 
              type="submit" disabled={status.type === 'loading'}
              className="w-full py-3 bg-gray-900 dark:bg-blue-600 text-white font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all disabled:opacity-70 text-sm"
            >
              {status.type === 'loading' ? 'Saving...' : 'Add Service'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Service List */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Services</h3>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <Wrench className="text-gray-300 dark:text-gray-600 mb-3" size={32} />
                <p>No services added yet.</p>
              </div>
            ) : (
              services.map(service => (
                <div key={service.id} className="p-6 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                    {service.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">{service.description}</p>}
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-bold text-gray-900 dark:text-white">Ksh {service.price.toLocaleString()}</span>
                    <button className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
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

export default Services;