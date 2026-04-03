import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AddItem from './pages/AddItem';
import Inventory from './pages/Inventory';
import Checkout from './pages/Checkout';
import Services from './pages/Services';
import DailySales from './pages/DailySales';
import SalesHistory from './pages/SalesHistory';
import Settings from './pages/Settings'; // <-- 1. Import the Settings page
import AdminGate from './components/AdminGate';

function App() {
  return (
    <Router>
     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
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

            {/* <-- 2. Add the Settings Route --> */}
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