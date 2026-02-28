import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Camera, Bell, Shield, Key, Save, Loader2, Zap, Award, Upload } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsViewProps {
  currentUser: UserType;
  onUpdateUser: (user: UserType) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  t: (key: any) => string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onUpdateUser, showToast, t }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'vendor'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      avatar: avatarPreview,
      password: formData.get('password') || undefined
    };
    
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data) 
      });
      const result = await res.json();
      if (result.success) {
        onUpdateUser(result.user);
        showToast(t('profile_updated') || 'Profile updated successfully!', 'success');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    ...(currentUser.role === 'buyer' ? [{ id: 'vendor', label: t('become_vendor'), icon: Zap }] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">{t('settings_title')}</h2>
        <p className="text-slate-500 mt-2">{t('settings_subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{t('profile_info')}</h3>
                      <p className="text-sm text-slate-500 mt-1">{t('profile_subtitle')}</p>
                    </div>
                    <User className="text-slate-300" size={24} />
                  </div>
                  
                  <div className="p-8">
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="relative group">
                          <img 
                            src={avatarPreview} 
                            alt="Avatar" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ring-1 ring-slate-200" 
                          />
                          <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          </label>
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Profile Picture</label>
                          <div className="flex gap-2">
                            <input 
                              required 
                              name="avatar" 
                              type="text" 
                              value={avatarPreview}
                              onChange={(e) => setAvatarPreview(e.target.value)}
                              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                            />
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 border border-slate-200">
                              <Upload size={18} />
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">Upload from device or provide a public image URL.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              required 
                              name="name" 
                              type="text" 
                              defaultValue={currentUser.name} 
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              required 
                              name="email" 
                              type="email" 
                              defaultValue={currentUser.email} 
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end border-t border-slate-100">
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                          {t('save_changes')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{t('security')}</h3>
                      <p className="text-sm text-slate-500 mt-1">Manage your password and security preferences.</p>
                    </div>
                    <Shield className="text-slate-300" size={24} />
                  </div>
                  
                  <div className="p-8">
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      {/* Hidden fields to keep other data */}
                      <input type="hidden" name="name" value={currentUser.name} />
                      <input type="hidden" name="email" value={currentUser.email} />
                      <input type="hidden" name="avatar" value={currentUser.avatar} />

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            name="password" 
                            type="password" 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                            placeholder="••••••••" 
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Leave blank if you don't want to change your password.</p>
                      </div>

                      <div className="pt-4 flex justify-end border-t border-slate-100">
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                          {t('update_password')}
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 mb-4">Two-Factor Authentication</h4>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
                            <Shield size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => showToast('2FA setup is coming soon!', 'success')}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{t('notifications')}</h3>
                      <p className="text-sm text-slate-500 mt-1">Choose how you want to be notified.</p>
                    </div>
                    <Bell className="text-slate-300" size={24} />
                  </div>
                  
                  <div className="p-8">
                    <div className="space-y-6">
                      {[
                        { title: 'Order Updates', desc: 'Get notified when your order status changes.' },
                        { title: 'New Arrivals', desc: 'Be the first to know about new products.' },
                        { title: 'Promotions', desc: 'Receive exclusive offers and discounts.' },
                        { title: 'Security Alerts', desc: 'Get notified about suspicious activity.' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{item.title}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={() => showToast('Preferences saved!', 'success')}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vendor' && currentUser.role === 'buyer' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{t('become_vendor')}</h3>
                      <p className="text-sm text-slate-500 mt-1">{t('vendor_subtitle')}</p>
                    </div>
                    <Zap className="text-indigo-600" size={24} />
                  </div>
                  
                  <div className="p-8 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                        <Award size={40} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">{t('ready_launch')}</h4>
                      <p className="text-slate-600">
                        {t('vendor_desc')}
                      </p>
                      <div className="pt-4">
                        <button 
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              const res = await fetch(`/api/users/${currentUser.id}/upgrade-to-vendor`, { method: 'POST' });
                              const result = await res.json();
                              if (result.success) {
                                onUpdateUser(result.user);
                                showToast(t('congrats_vendor'), 'success');
                                setActiveTab('profile');
                              } else {
                                showToast('Failed to upgrade account', 'error');
                              }
                            } catch (err) {
                              showToast('Network error', 'error');
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                          className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                          {t('upgrade_vendor_btn')}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('kyc_note')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
