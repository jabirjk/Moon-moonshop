import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, User, Mail, Lock, Eye, EyeOff, X, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  initialMode?: 'login' | 'signup';
  initialRole?: 'buyer' | 'vendor';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogin, 
  showToast, 
  initialMode = 'login',
  initialRole = 'buyer'
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Reset state when modal opens/closes or mode changes
  React.useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setResetSent(false);
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [isOpen, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === 'forgot-password') {
        // Mock password reset
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResetSent(true);
        showToast('Password reset link sent to your email', 'success');
        setIsLoading(false);
        return;
      }

      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = authMode === 'login' 
        ? { email, password } 
        : { name, email, password, role: initialRole };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (data.success) {
        onLogin(data.user);
        onClose();
      } else {
        showToast(data.error || 'Authentication failed', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const res = await fetch(`/api/auth/${provider}/url`);
      const { url } = await res.json();
      
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(url, `${provider}_login`, `width=${width},height=${height},left=${left},top=${top}`);
    } catch (error) {
      showToast('Failed to initiate social login', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden"
          >
            <div className="relative">
              {/* Header Pattern */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-10 right-10 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl"></div>
              </div>

              <div className="relative px-8 pt-8 pb-8">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg text-indigo-600 mb-4 relative z-10 -mt-16">
                    <Moon size={32} fill="currentColor" className="text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">
                    {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
                  </h2>
                  <p className="text-slate-500 mt-1 text-sm">
                    {authMode === 'login' ? 'Enter your details to access your account' : 
                     authMode === 'signup' ? 'Join us to start your journey' : 
                     'We\'ll send you a link to reset your password'}
                  </p>
                </div>

                {authMode === 'forgot-password' && resetSent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Check your email</h3>
                    <p className="text-slate-500 mb-6">We've sent a password reset link to <span className="font-medium text-slate-900">{email}</span></p>
                    <button 
                      onClick={() => setAuthMode('login')}
                      className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center justify-center gap-2 mx-auto"
                    >
                      Back to Sign In <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {authMode === 'signup' && (
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                          type="text" 
                          placeholder="Full Name" 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          required 
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                        />
                      </div>
                    )}
                    
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                      />
                    </div>

                    {authMode !== 'forgot-password' && (
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Password" 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          required 
                          className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    )}

                    {authMode === 'login' && (
                      <div className="flex justify-end">
                        <button 
                          type="button" 
                          onClick={() => setAuthMode('forgot-password')}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                        authMode === 'login' ? 'Sign In' : 
                        authMode === 'signup' ? 'Create Account' : 
                        'Send Reset Link'
                      )}
                    </button>
                  </form>
                )}

                {authMode !== 'forgot-password' && (
                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                      <div className="relative flex justify-center text-xs uppercase tracking-wider font-medium"><span className="px-4 bg-white text-slate-400">Or continue with</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <button 
                        type="button" 
                        onClick={() => handleSocialLogin('google')}
                        className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Google
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleSocialLogin('apple')}
                        className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.64 3.57-1.64.6 0 1.48.16 2.11.83-.06.05-1.22.74-1.22 2.28 0 1.98 1.76 2.65 1.82 2.67-.02.05-.29.98-1.09 2.25-.81 1.25-1.69 2.5-2.92 2.5-.01 0-.01 0-.02 0zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                        Apple
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <p className="text-slate-500 text-sm">
                    {authMode === 'login' ? "Don't have an account? " : 
                     authMode === 'signup' ? "Already have an account? " : 
                     "Remember your password? "}
                    <button 
                      onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
                      className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
