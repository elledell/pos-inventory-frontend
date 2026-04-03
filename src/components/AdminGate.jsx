import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

const AdminGate = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('adminPIN')) {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ask Spring Boot if the PIN is correct!
      const response = await fetch('http://192.168.3.4:8080/api/settings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin })
      });

      if (response.ok) {
        setIsUnlocked(true);
        sessionStorage.setItem('adminPIN', pin); 
        setError(false);
      } else {
        setError(true);
        setPin('');
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (isUnlocked) return children;

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 h-screen p-6 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-sm w-full text-center transition-colors duration-200">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Access</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Enter the master PIN to continue.</p>
        <form onSubmit={handleUnlock}>
          <div className="mb-6 relative">
            <input 
              type="text" 
              style={{ WebkitTextSecurity: 'disc' }} // Fixes browser "weak password" warning
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="****"
              maxLength="4"
              className={`w-full text-center tracking-[1em] text-2xl font-bold py-4 bg-gray-50 dark:bg-gray-700/50 border ${error ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-500/30'} rounded-xl outline-none transition-all dark:text-white dark:placeholder-gray-500`}
              autoFocus
            />
            {error && <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-2 flex items-center justify-center gap-1"><ShieldAlert size={14} /> Incorrect PIN</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            {loading ? 'Verifying...' : 'Unlock'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminGate;