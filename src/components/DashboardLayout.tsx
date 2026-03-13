import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Award, TrendingUp, Bell } from 'lucide-react';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
  role: 'buyer' | 'vendor' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children, role }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </header>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
