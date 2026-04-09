import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AddItem from './pages/AddItem';
import Inventory from './pages/Inventory';
import Checkout from './pages/Checkout';
import Services from './pages/Services';
import DailySales from './pages/DailySales';
import SalesHistory from './pages/SalesHistory';
import Settings from './pages/Settings';
import AdminGate from './components/AdminGate';

// Import idle screen components
import { useIdleTimer } from './hooks/useIdleTimer';
import IdleScreen from './components/IdleScreen';

function App() {
  // Set idle time to 30 minutes (30 * 60 * 1000 milliseconds)
  // For testing, you can use 10 seconds: 10 * 1000
  const { isIdle, resetTimer } = useIdleTimer(30 * 60 * 1000);

  // NEW: Track if the user has "woken up" the app at least once
  const [isStarted, setIsStarted] = useState(false);

  // Unified wake-up handler:
  // - On first click (initial idle screen) → starts the app + timer
  // - On subsequent idle timeouts → just resets the timer
  const handleWakeUp = () => {
    setIsStarted(true);
    resetTimer();
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
        
        {/* 
          Show IdleScreen in TWO cases:
          1. App has never been started yet (initial screen)
          2. User has been idle for the timeout period
        */}
        {(!isStarted || isIdle) && (
          <IdleScreen onWakeUp={handleWakeUp} />
        )}
        
        <main>
          <Routes>
            {/* ==========================================
                UNPROTECTED ROUTES (Open to everyone)
                ========================================== */}
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            
            {/* ==========================================
                PROTECTED ROUTES (Require Admin PIN)
                ========================================== */}
            <Route path="/add-item" element={
              <AdminGate><AddItem /></AdminGate>
            } />
            
            <Route path="/inventory" element={
              <AdminGate><Inventory /></AdminGate>
            } />
            
            <Route path="/services" element={
              <AdminGate><Services /></AdminGate>
            } />
            
            <Route path="/daily-sales" element={
              <AdminGate><DailySales /></AdminGate>
            } />
            
            <Route path="/sales-history" element={
              <AdminGate><SalesHistory /></AdminGate>
            } />

            <Route path="/settings" element={
              <AdminGate><Settings /></AdminGate>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;