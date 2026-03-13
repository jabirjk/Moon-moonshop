import React, { useState } from 'react';
import { ShoppingCart, Menu, X, User, Search, Bell, Moon, Sun, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentUser: any;
  logout: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  isScrolled: boolean;
  setIsAuthOpen: (open: boolean) => void;
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  logout,
  theme,
  setTheme,
  isScrolled,
  setIsAuthOpen,
  cartCount,
  setIsCartOpen,
  currentView,
  setCurrentView
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setCurrentView('shop')}>
            <span className="text-2xl font-bold text-emerald-600">MOONSHOP</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => setCurrentView('shop')} className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Shop</button>
            <button className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Fashion</button>
            <button className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Home</button>
            <button className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Accessories</button>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-slate-500 hover:text-emerald-600"><Search size={20} /></button>
            <button onClick={() => setIsCartOpen(true)} className="text-slate-500 hover:text-emerald-600 relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{cartCount}</span>}
            </button>
            <div className="flex items-center gap-2">
              {theme === 'light' ? (
                <button onClick={() => setTheme('dark')} className="text-slate-500 hover:text-emerald-600"><Moon size={20} /></button>
              ) : (
                <button onClick={() => setTheme('light')} className="text-slate-500 hover:text-emerald-600"><Sun size={20} /></button>
              )}
            </div>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentView(currentUser.role === 'admin' ? 'admin_dashboard' : currentUser.role === 'vendor' ? 'vendor_dashboard' : 'buyer_dashboard')} className="text-slate-600 hover:text-emerald-600 font-medium">Dashboard</button>
                <button onClick={logout} className="text-slate-500 hover:text-rose-600"><User size={20} /></button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-full font-medium hover:bg-emerald-700 transition-colors">Login</button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-500 hover:text-emerald-600">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl z-40"
          >
            <div className="px-4 py-6 space-y-4">
              <button onClick={() => { setCurrentView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 text-slate-800 hover:text-emerald-600 font-semibold text-lg">Shop</button>
              <button className="block w-full text-left py-3 text-slate-800 hover:text-emerald-600 font-semibold text-lg">Fashion</button>
              <button className="block w-full text-left py-3 text-slate-800 hover:text-emerald-600 font-semibold text-lg">Home</button>
              <button className="block w-full text-left py-3 text-slate-800 hover:text-emerald-600 font-semibold text-lg">Accessories</button>
              <div className="pt-4 border-t border-slate-100">
                {currentUser ? (
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 text-rose-600 font-semibold text-lg">Logout</button>
                ) : (
                  <button onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }} className="block w-full text-center py-3 bg-emerald-600 text-white rounded-xl font-semibold text-lg">Login</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
