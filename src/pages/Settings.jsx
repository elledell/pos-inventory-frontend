import React, { useState } from 'react';
import { ArrowLeft, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const [newPin, setNewPin] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChangePin = async (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setStatus({ type: 'error', message: 'PIN must be at least 4 digits.' });
      return;
    }

    try {
      const response = await fetch('https://pos-inventory-backend-vmlq.onrender.com/api/settings/update-pin', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-PIN': sessionStorage.getItem('adminPIN') // Prove we are authorized to change it!
        },
        body: JSON.stringify({ newPin: newPin })
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'PIN updated successfully!' });
        sessionStorage.setItem('adminPIN', newPin); // Update the active session
        setNewPin('');
      } else {
        setStatus({ type: 'error', message: 'Failed to update PIN.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Server error.' });
    }
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12 font-sans transition-colors duration-200">
      
      {/* Toast Notification */}
      {status.message && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all ${status.type === 'success' ? 'bg-white dark:bg-gray-800 border-green-100 dark:border-green-900/50' : 'bg-white dark:bg-gray-800 border-red-100 dark:border-red-900/50'}`}>
          {status.type === 'success' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
          <span className="font-bold text-sm text-gray-800 dark:text-white">{status.message}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"><ArrowLeft size={20} /> Back to Dashboard</Link>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">System Settings</h2>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-50 dark:border-gray-700">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Key size={24} /></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Admin PIN</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update the master PIN used to access inventory and history.</p>
            </div>
          </div>

          <form onSubmit={handleChangePin} className="max-w-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New PIN</label>
            <input 
              type="password" 
              value={newPin} 
              onChange={(e) => setNewPin(e.target.value)} 
              maxLength="4"
              placeholder="Enter 4-digit PIN" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl mb-4 tracking-[0.5em] font-bold outline-none focus:border-blue-500 dark:text-white dark:placeholder-gray-500 transition-colors"
            />
            <button type="submit" className="w-full py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors">Update PIN</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;