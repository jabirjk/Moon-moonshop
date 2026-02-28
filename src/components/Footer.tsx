import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight, Moon } from 'lucide-react';
import { User } from '../types';

interface FooterProps {
  currentUser: User | null;
  setCurrentView: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ currentUser, setCurrentView }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white mb-4">
              <Moon size={24} className="text-indigo-500" />
              <span className="font-bold text-xl tracking-tight">Moonshop</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Premium gear for the modern explorer. Curated collections for your next adventure.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links - Role Based */}
          <div>
            <h3 className="text-white font-bold mb-6">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => setCurrentView('shop')} className="hover:text-indigo-400 transition-colors">Shop All Gear</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">New Arrivals</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">Featured Collections</button></li>
              {!currentUser && (
                <li><button className="hover:text-indigo-400 transition-colors">Gift Cards</button></li>
              )}
            </ul>
          </div>

          {/* Account / Role Specific */}
          <div>
            <h3 className="text-white font-bold mb-6">
              {currentUser ? (
                currentUser.role === 'vendor' ? 'Vendor Hub' : 
                currentUser.role === 'admin' ? 'Admin Controls' : 'My Account'
              ) : 'Support'}
            </h3>
            <ul className="space-y-3 text-sm">
              {!currentUser && (
                <>
                  <li><button className="hover:text-indigo-400 transition-colors">Help Center</button></li>
                  <li><button className="hover:text-indigo-400 transition-colors">Shipping & Returns</button></li>
                  <li><button className="hover:text-indigo-400 transition-colors">Order Status</button></li>
                  <li><button className="hover:text-indigo-400 transition-colors">Contact Us</button></li>
                </>
              )}

              {currentUser?.role === 'buyer' && (
                <>
                  <li><button onClick={() => setCurrentView('buyer_dashboard')} className="hover:text-indigo-400 transition-colors">Dashboard</button></li>
                  <li><button onClick={() => setCurrentView('buyer_orders')} className="hover:text-indigo-400 transition-colors">My Orders</button></li>
                  <li><button onClick={() => setCurrentView('buyer_wishlist')} className="hover:text-indigo-400 transition-colors">My Wishlist</button></li>
                  <li><button onClick={() => setCurrentView('settings')} className="hover:text-indigo-400 transition-colors">Account Settings</button></li>
                </>
              )}

              {currentUser?.role === 'vendor' && (
                <>
                  <li><button onClick={() => setCurrentView('vendor_dashboard')} className="hover:text-indigo-400 transition-colors">Vendor Dashboard</button></li>
                  <li><button onClick={() => setCurrentView('vendor_products')} className="hover:text-indigo-400 transition-colors">Manage Products</button></li>
                  <li><button onClick={() => setCurrentView('vendor_orders')} className="hover:text-indigo-400 transition-colors">Store Orders</button></li>
                  <li><button className="hover:text-indigo-400 transition-colors">Seller Support</button></li>
                </>
              )}

              {currentUser?.role === 'admin' && (
                <>
                  <li><button onClick={() => setCurrentView('admin_dashboard')} className="hover:text-indigo-400 transition-colors">Platform Overview</button></li>
                  <li><button onClick={() => setCurrentView('admin_users')} className="hover:text-indigo-400 transition-colors">User Management</button></li>
                  <li><button onClick={() => setCurrentView('admin_orders')} className="hover:text-indigo-400 transition-colors">All Orders</button></li>
                  <li><button className="hover:text-indigo-400 transition-colors">System Settings</button></li>
                </>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">Subscribe to our newsletter for the latest drops and exclusive offers.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="bg-slate-800 border-none text-white text-sm rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {currentYear} Moonshop Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="hover:text-slate-300 transition-colors">Privacy Policy</button>
            <button className="hover:text-slate-300 transition-colors">Terms of Service</button>
            <button className="hover:text-slate-300 transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
