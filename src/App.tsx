import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Moon, Star, Search, Menu, X, ChevronRight, ChevronLeft, Plus, Minus, Trash2, CheckCircle2, CreditCard, Package, LayoutDashboard, History, ChevronDown, StarHalf, Truck, LogOut, Users, Settings, Tag, DollarSign, Activity, Box, PlusCircle, Heart, TrendingUp, Filter, Award, Zap, Bell, Mail, Lock, Eye, EyeOff, ArrowRight, Globe, Sparkles, Video, Image as ImageIcon, Upload, MessageSquare } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import SettingsView from './components/SettingsView';
import { User as UserType, Product, Review, CartItem } from './types';

// --- Translations ---
const translations = {
  en: {
    become_seller: "Become a Seller",
    shop_gear: "Shop",
    dashboard: "Dashboard",
    my_orders: "My Orders",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    signup: "Sign Up",
    search_placeholder: "Search gear...",
    menu: "Menu",
    sell_on_moon_toast: "Interested in selling? Visit settings to upgrade your account!",
    wishlist: "Wishlist",
    products: "Products",
    orders: "Orders",
    kyc: "KYC Verification",
    users: "Users",
    admin: "Admin",
    vendor: "Vendor",
    buyer: "Buyer",
    welcome: "Welcome back",
    settings_title: "Account Settings",
    settings_subtitle: "Manage your account preferences and security settings.",
    profile: "Profile",
    security: "Security",
    notifications: "Notifications",
    become_vendor: "Become a Vendor",
    profile_info: "Profile Information",
    profile_subtitle: "Update your public profile details.",
    save_changes: "Save Changes",
    update_password: "Update Password",
    upgrade_vendor_btn: "Upgrade to Vendor Account",
    congrats_vendor: "Congratulations! You are now a Vendor.",
    profile_updated: "Profile updated successfully!",
    my_products: "My Products",
    store_orders: "Store Orders",
    platform_overview: "Platform Overview",
    kyc_requests: "KYC Requests",
    all_orders: "All Orders",
    sign_out: "Sign Out",
    sign_in: "Sign In",
    notifications_title: "Notifications",
    mark_all_read: "Mark all as read",
    no_notifications: "No notifications yet",
    vendor_subtitle: "Start selling your gear to our global community.",
    ready_launch: "Ready to launch your store?",
    vendor_desc: "By becoming a vendor, you'll be able to list products, manage orders, and grow your business on the moon.",
    kyc_note: "Note: You will need to complete KYC verification after upgrading to start selling.",
  },
  am: {
    become_seller: "ሻጭ ይሁኑ",
    shop_gear: "ዕቃዎችን ይግዙ",
    dashboard: "ዳሽቦርድ",
    my_orders: "ትዕዛዞቼ",
    settings: "ቅንብሮች",
    logout: "ውጣ",
    login: "ግባ",
    signup: "ተመዝገብ",
    search_placeholder: "ዕቃዎችን ፈልግ...",
    menu: "ምናሌ",
    sell_on_moon_toast: "መሸጥ ይፈልጋሉ? መለያዎን ለማሻሻል ቅንብሮችን ይጎብኙ!",
    wishlist: "ምኞት ዝርዝር",
    products: "ምርቶች",
    orders: "ትዕዛዞች",
    kyc: "KYC ማረጋገጫ",
    users: "ተጠቃሚዎች",
    admin: "አስተዳዳሪ",
    vendor: "ሻጭ",
    buyer: "ገዢ",
    welcome: "እንኳን ደህና መጡ",
    settings_title: "የመለያ ቅንብሮች",
    settings_subtitle: "የመለያ ምርጫዎችዎን እና የደህንነት ቅንብሮችዎን ያስዳድሩ።",
    profile: "መገለጫ",
    security: "ደህንነት",
    notifications: "ማሳወቂያዎች",
    become_vendor: "ሻጭ ይሁኑ",
    profile_info: "የመገለጫ መረጃ",
    profile_subtitle: "የህዝብ መገለጫ ዝርዝሮችዎን ያዘምኑ።",
    save_changes: "ለውጦችን አስቀምጥ",
    update_password: "የይለፍ ቃል አዘምን",
    upgrade_vendor_btn: "ወደ ሻጭ መለያ ያሻሽሉ",
    congrats_vendor: "እንኳን ደስ አለዎት! አሁን ሻጭ ነዎት።",
    profile_updated: "መገለጫው በተሳካ ሁኔታ ተዘምኗል!",
    my_products: "ምርቶቼ",
    store_orders: "የመደብር ትዕዛዞች",
    platform_overview: "የመድረክ አጠቃላይ እይታ",
    kyc_requests: "የKYC ጥያቄዎች",
    all_orders: "ሁሉም ትዕዛዞች",
    sign_out: "ውጣ",
    sign_in: "ግባ",
    notifications_title: "ማሳወቂያዎች",
    mark_all_read: "ሁሉንም እንደተነበበ ምልክት አድርግ",
    no_notifications: "ገና ምንም ማሳወቂያ የለም",
    vendor_subtitle: "ዕቃዎችዎን ለዓለም አቀፍ ማህበረሰባችን መሸጥ ይጀምሩ።",
    ready_launch: "መደብርዎን ለመክፈት ዝግጁ ነዎት?",
    vendor_desc: "ሻጭ በመሆን ምርቶችን መዘርዘር፣ ትዕዛዞችን ማስተዳደር እና ንግድዎን በጨረቃ ላይ ማሳደግ ይችላሉ።",
    kyc_note: "ማሳሰቢያ፡ መሸጥ ለመጀመር ካሻሻሉ በኋላ የKYC ማረጋገጫ ማጠናቀቅ ያስፈልግዎታል።",
  },
  om: {
    become_seller: "Daldalaa Ta'i",
    shop_gear: "Meeshaalee Bitadhu",
    dashboard: "Daashboordii",
    my_orders: "Ajajawwan Koo",
    settings: "Sajoo",
    logout: "Ba'i",
    login: "Seeni",
    signup: "Galmaa'i",
    search_placeholder: "Meeshaalee barbaadi...",
    menu: "Minuu",
    sell_on_moon_toast: "Gurguruu barbaadduu? Akkaawuntii keessan fooyyessuuf sajoo daawwadhaa!",
    wishlist: "Hawwii",
    products: "Oomishaalee",
    orders: "Ajajawwan",
    kyc: "Mirkaneessa KYC",
    users: "Fayyadamtoota",
    admin: "Bulchaa",
    vendor: "Daldalaa",
    buyer: "Bitaa",
    welcome: "Baga nagaan dhuftan",
    settings_title: "Sajoo Akkaawuntii",
    settings_subtitle: "Filannoo akkaawuntii fi sajoo nageenyaa keessan bulchaa.",
    profile: "Proofayilii",
    security: "Nageenya",
    notifications: "Beeksisa",
    become_vendor: "Daldalaa Ta'i",
    profile_info: "Oodeeffannoo Proofayilii",
    profile_subtitle: "Bal'ina proofayilii keessan kan uummataa fooyyessaa.",
    save_changes: "Jijjiirama Olkaa'i",
    update_password: "Jecha icciitii fooyyessi",
    upgrade_vendor_btn: "Gara akkaawuntii daldalaatti fooyyessi",
    congrats_vendor: "Baga gammaddan! Amma daldalaa dha.",
    profile_updated: "Proofayiliin milkaa'inaan fooyya'eera!",
    my_products: "Oomishaalee Koo",
    store_orders: "Ajajawwan Suuqii",
    platform_overview: "Walii-gala Pilaatfoormii",
    kyc_requests: "Gaaffii KYC",
    all_orders: "Ajajawwan Hunda",
    sign_out: "Ba'i",
    sign_in: "Seeni",
    notifications_title: "Beeksisa",
    mark_all_read: "Hunda akka dubbifametti mallatteessi",
    no_notifications: "Hamma yoonaatti beeksisi hin jiru",
    vendor_subtitle: "Meeshaalee keessan hawaasa keenya addunyaatiif gurguruu jalqabaa.",
    ready_launch: "Suuqii keessan banuuf qophiidhaa?",
    vendor_desc: "Daldalaa ta'uun oomishaalee tarreessuu, ajajawwan bulchuu fi daldala keessan ji'a irratti guddisuu dandeessu.",
    kyc_note: "Hubachiisa: Gurguruu jalqabuuf erga fooyyessitanii booda mirkaneessa KYC xumuruu qabdu.",
  }
};

// --- Main App Component ---
export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [currentView, setCurrentView] = useState<'shop' | 'buyer_dashboard' | 'buyer_orders' | 'buyer_wishlist' | 'vendor_dashboard' | 'vendor_products' | 'vendor_orders' | 'admin_dashboard' | 'admin_users' | 'admin_products' | 'admin_orders' | 'admin_kyc' | 'settings' | 'product_details' | 'vendor_storefront'>('shop');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<'buyer' | 'vendor'>('buyer');
  const [language, setLanguage] = useState<'en' | 'am' | 'om'>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  // Shop State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUserId, setActiveChatUserId] = useState<number | null>(null);
  const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // --- Initialization ---
  useEffect(() => {
    const savedUser = localStorage.getItem('moonshop_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setDefaultViewForRole(user.role);
    }
  }, []);

  const setDefaultViewForRole = (role: string) => {
    if (role === 'admin') setCurrentView('admin_dashboard');
    else if (role === 'vendor') setCurrentView('vendor_dashboard');
    else setCurrentView('buyer_dashboard');
  };

  const fetchProducts = () => {
    setLoadingProducts(true);
    fetch('/api/products').then(res => res.json()).then(data => { setProducts(data); setLoadingProducts(false); });
  };

  const fetchNotifications = () => {
    if (currentUser) {
      fetch(`/api/users/${currentUser.id}/notifications`).then(res => res.json()).then(setNotifications);
    }
  };

  useEffect(() => { if (currentView === 'shop') fetchProducts(); }, [currentView]);
  useEffect(() => { fetchNotifications(); }, [currentUser]);

  // Chat WebSocket Initialization
  useEffect(() => {
    if (currentUser) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}`);
      
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', userId: currentUser.id }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          if (activeChatUserId === data.message.sender_id) {
            setChatMessages(prev => [...prev, data.message]);
          } else {
            fetchConversations();
            setUnreadChatCount(prev => prev + 1);
          }
        } else if (data.type === 'chat_sent') {
          setChatMessages(prev => [...prev, data.message]);
          fetchConversations();
        }
      };

      setChatSocket(ws);
      fetchConversations();

      return () => ws.close();
    } else {
      setChatSocket(null);
      setConversations([]);
      setUnreadChatCount(0);
    }
  }, [currentUser, activeChatUserId]);

  const fetchConversations = () => {
    if (currentUser) {
      fetch(`/api/chat/conversations/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          setConversations(data);
          const totalUnread = data.reduce((acc: number, conv: any) => acc + conv.unread_count, 0);
          setUnreadChatCount(totalUnread);
        });
    }
  };

  const fetchChatMessages = (otherUserId: number) => {
    if (currentUser) {
      fetch(`/api/chat/messages/${currentUser.id}/${otherUserId}`)
        .then(res => res.json())
        .then(data => {
          setChatMessages(data);
          fetchConversations(); // Refresh unread count
        });
    }
  };

  useEffect(() => {
    if (activeChatUserId) {
      fetchChatMessages(activeChatUserId);
    }
  }, [activeChatUserId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_SUCCESS' && event.data.user) {
        const user = event.data.user;
        setCurrentUser(user);
        localStorage.setItem('moonshop_user', JSON.stringify(user));
        setDefaultViewForRole(user.role);
        showToast(`Welcome back, ${user.name}!`);
        setIsAuthOpen(false);
        if (user.role === 'buyer') {
          fetch(`/api/buyer/${user.id}/wishlist`).then(r => r.json()).then(setWishlist);
        }
        fetch(`/api/users/${user.id}/notifications`).then(r => r.json()).then(setNotifications);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- Handlers ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('moonshop_user');
    setCurrentView('shop');
    setCart([]);
    setWishlist([]);
    setNotifications([]);
  };

  // --- Auth Modal ---
  // Removed inline AuthModal component


  const toggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    if (currentUser.role !== 'buyer') {
      showToast('Please log in as a buyer to use the wishlist', 'error');
      return;
    }
    
    // Optimistic update
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
    
    try {
      await fetch(`/api/buyer/${currentUser.id}/wishlist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      });
    } catch (err) {
      // Revert on error
      setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
      showToast('Failed to update wishlist', 'error');
    }
  };

  // --- Sub-Components for Views ---

  const StarRating = ({ rating, setRating }: { rating: number, setRating?: (r: number) => void }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating && setRating(star)}
            className={`${setRating ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            disabled={!setRating}
          >
            <Star
              size={16}
              className={`${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} ${setRating ? 'hover:fill-amber-400 hover:text-amber-400' : ''}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const QuickViewReviews = ({ product }: { product: Product }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReviews = () => {
      fetch(`/api/products/${product.id}/reviews`)
        .then(res => res.json())
        .then(data => { setReviews(data); setLoading(false); });
    };

    useEffect(() => { fetchReviews(); }, [product.id]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser || currentUser.role !== 'buyer') return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/products/${product.id}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUser.id, rating: newRating, comment: newComment })
        });
        if (res.ok) {
          setNewComment('');
          setNewRating(5);
          fetchReviews();
          showToast('Review submitted successfully!');
        } else {
          showToast('Failed to submit review', 'error');
        }
      } catch (err) {
        showToast('Error submitting review', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="mt-8 border-t border-slate-200 pt-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Customer Reviews</h3>
        
        {(!currentUser || currentUser.role === 'buyer') && (
          <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {!currentUser ? (
              <div className="text-center py-6">
                <p className="text-slate-600 mb-4">Please log in to write a review.</p>
                <button type="button" onClick={() => { setAuthMode('login'); setAuthRole('buyer'); setIsAuthOpen(true); }} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-600 transition-colors">Sign In</button>
              </div>
            ) : (
              <>
                <h4 className="font-medium text-slate-900 mb-4">Write a Review</h4>
                <div className="mb-4">
                  <label className="block text-sm text-slate-600 mb-2">Rating</label>
                  <StarRating rating={newRating} setRating={setNewRating} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-600 mb-2">Your Review</label>
                  <textarea
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="What did you think about this product?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </>
            )}
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : reviews.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <img src={review.avatar} alt={review.user_name} className="w-10 h-10 rounded-full bg-slate-200" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{review.user_name}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm mt-3">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const VendorReviews = ({ vendorId, onReviewSubmitted }: { vendorId: number, onReviewSubmitted?: () => void }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReviews = () => {
      fetch(`/api/vendor/${vendorId}/reviews`)
        .then(res => res.json())
        .then(data => { setReviews(data); setLoading(false); });
    };

    useEffect(() => { fetchReviews(); }, [vendorId]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser || currentUser.role !== 'buyer') return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/vendor/${vendorId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUser.id, rating: newRating, comment: newComment })
        });
        if (res.ok) {
          setNewComment('');
          setNewRating(5);
          fetchReviews();
          if (onReviewSubmitted) onReviewSubmitted();
          showToast('Vendor review submitted successfully!');
        } else {
          showToast('Failed to submit vendor review', 'error');
        }
      } catch (err) {
        showToast('Error submitting vendor review', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-8">Vendor Ratings & Reviews</h3>
        
        {(!currentUser || currentUser.role === 'buyer') && (
          <form onSubmit={handleSubmit} className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {!currentUser ? (
              <div className="text-center py-6">
                <p className="text-slate-600 mb-4">Please log in to review this vendor.</p>
                <button type="button" onClick={() => { setAuthMode('login'); setAuthRole('buyer'); setIsAuthOpen(true); }} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-600 transition-colors">Sign In</button>
              </div>
            ) : (
              <>
                <h4 className="font-bold text-slate-900 mb-4">Rate your experience with this vendor</h4>
                <div className="mb-4">
                  <label className="block text-sm text-slate-600 mb-2">Rating</label>
                  <StarRating rating={newRating} setRating={setNewRating} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-600 mb-2">Your Feedback</label>
                  <textarea
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="How was the service and communication?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Vendor Review'}
                </button>
              </>
            )}
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
            <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500">No storefront reviews yet. Be the first to review this vendor!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {reviews.map(review => (
              <div key={review.id} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                <div className="flex items-center gap-4 mb-4">
                  <img src={review.avatar} alt={review.user_name} className="w-12 h-12 rounded-full bg-slate-200 shadow-sm" />
                  <div>
                    <p className="font-bold text-slate-900">{review.user_name}</p>
                    <div className="flex items-center gap-3">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-slate-400 font-medium">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const QuickViewModal = ({ isOpen, onClose, product }: { isOpen: boolean, onClose: () => void, product: Product | null }) => {
    if (!product) return null;

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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden flex flex-col md:flex-row"
            >
              <button onClick={onClose} className="absolute top-4 right-4 z-[80] p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md hover:bg-white transition-all text-slate-500 hover:text-slate-900">
                <X size={24} />
              </button>
              
              <div className="md:w-1/2 bg-slate-100 relative min-h-[300px] md:min-h-full">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover absolute inset-0" referrerPolicy="no-referrer" />
              </div>
              
              <div className="md:w-1/2 p-6 md:p-10 overflow-y-auto">
                <div className="mb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">{product.category}</span>
                  <h2 className="text-3xl font-bold text-slate-900">{product.name}</h2>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={Math.round(product.average_rating)} />
                  <span className="text-sm text-slate-500">{product.average_rating.toFixed(1)} ({product.review_count} reviews)</span>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-3xl font-bold text-slate-900">${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  {product.stock > 0 ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">In Stock</span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-full">Out of Stock</span>
                  )}
                </div>
                
                <p className="text-slate-600 mb-8 line-clamp-4">{product.description}</p>
                
                <div className="flex flex-col gap-4 mb-8">
                  <button 
                    onClick={() => { addToCart(product); setIsCartOpen(true); onClose(); }} 
                    disabled={product.stock === 0}
                    className={`w-full font-bold py-3.5 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 ${product.stock > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <ShoppingCart size={20} /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  
                  <button 
                    onClick={() => { setSelectedProductId(product.id); setCurrentView('product_details'); onClose(); }}
                    className="w-full font-bold py-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    View Full Details <ArrowRight size={20} />
                  </button>
                </div>
                
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Reviews</h3>
                  <QuickViewReviews product={product} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  // 1. Shop View (Accessible to all, but primary for buyers)
  const ShopView = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
    
    // Reset page when filters change
    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, selectedCategory, minPrice, maxPrice, inStockOnly, sortBy]);

    const filtered = useMemo(() => {
      let f = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        const matchesMinPrice = minPrice === '' || p.price >= Number(minPrice);
        const matchesMaxPrice = maxPrice === '' || p.price <= Number(maxPrice);
        const matchesStock = inStockOnly ? p.stock > 0 : true;
        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock;
      });
      if (sortBy === 'price-asc') f.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-desc') f.sort((a, b) => b.price - a.price);
      if (sortBy === 'name') f.sort((a, b) => a.name.localeCompare(b.name));
      return f;
    }, [products, searchQuery, selectedCategory, sortBy, minPrice, maxPrice, inStockOnly]);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-12 relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl">
            <div className="absolute inset-0 opacity-40">
              <img src="https://picsum.photos/seed/moonshophero/1920/600" alt="Hero" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
            <div className="relative z-10 p-8 sm:p-16 md:w-2/3">
              <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-bold tracking-wider uppercase mb-4 border border-indigo-500/30">New Collection</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">Discover the Extraordinary.</h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl">Explore our curated selection of premium gear, authentic collectibles, and lifestyle products designed for the modern explorer.</p>
              <button onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2">
                Shop Now <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Filters & Controls */}
        <div id="product-grid" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sticky top-0 z-20 bg-slate-50/90 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full sm:w-auto">
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 mr-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${showFilters ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <Filter size={16} /> Filters
            </button>
            <button onClick={() => setSelectedCategory(null)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${!selectedCategory ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>All Gear</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>{cat}</button>
            ))}
          </div>
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-full text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 cursor-pointer shadow-sm">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-8 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price Range</label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')} className="w-24 pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" />
                    </div>
                    <span className="text-slate-400">-</span>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')} className="w-24 pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Availability</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${inStockOnly ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${inStockOnly ? 'left-5' : 'left-1'}`}></div>
                    </div>
                    <input type="checkbox" className="hidden" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">In Stock Only</span>
                  </label>
                </div>

                <button 
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setInStockOnly(false); }} 
                  className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors ml-auto"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {loadingProducts ? (
          <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm"><Package size={48} className="mx-auto text-slate-300 mb-4" /><h3 className="text-lg font-bold text-slate-900">No products found</h3><button onClick={() => {setSearchQuery(''); setSelectedCategory(null);}} className="mt-4 text-indigo-600 font-bold hover:text-indigo-700">Clear filters</button></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={product.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 relative">
                
                {/* Wishlist Button */}
                <button 
                  onClick={(e) => toggleWishlist(e, product.id)} 
                  className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all"
                >
                  <Heart size={18} className={wishlist.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                </button>

                <div className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer" onClick={() => { setSelectedProductId(product.id); setCurrentView('product_details'); }}>
                  <img src={product.image} alt={product.name} className={`w-full h-full object-cover object-center transition-transform duration-500 ${product.stock > 0 ? 'group-hover:scale-105' : 'opacity-50 grayscale'}`} referrerPolicy="no-referrer" />
                  
                  {/* Quick View Button */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); setIsQuickViewOpen(true); }}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
                    >
                      <Eye size={18} /> Quick View
                    </button>
                  </div>

                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-700 uppercase tracking-wider shadow-sm">{product.category}</span>
                    {product.stock === 0 && (
                      <span className="bg-rose-500/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-white uppercase tracking-wider shadow-sm">Out of Stock</span>
                    )}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight cursor-pointer hover:text-indigo-600 line-clamp-1" onClick={() => { setSelectedProductId(product.id); setCurrentView('product_details'); }}>{product.name}</h3>
                    <p className="text-lg font-bold text-indigo-600 ml-4">${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={Math.round(product.average_rating)} />
                    <span className="text-xs text-slate-500 font-medium">({product.review_count})</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedVendorId(product.vendor_id); setCurrentView('vendor_storefront'); }} className="text-xs text-slate-400 mb-3 font-medium hover:text-indigo-600 transition-colors text-left flex items-center gap-1">
                    Sold by {product.vendor_name}
                    {product.vendor_kyc_status === 'verified' && <CheckCircle2 size={12} className="text-blue-500" />}
                  </button>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                    disabled={product.stock === 0}
                    className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md ${product.stock > 0 ? 'bg-slate-900 text-white hover:bg-indigo-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <ShoppingCart size={18} /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </motion.div>
            ))}
            </div>

            {/* Pagination Controls */}
            {filtered.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: Math.ceil(filtered.length / itemsPerPage) }, (_, i) => i + 1).map(page => {
                  const totalPages = Math.ceil(filtered.length / itemsPerPage);
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-lg font-bold transition-colors ${currentPage === page ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return <span key={page} className="text-slate-400 px-1">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => {
                    setCurrentPage(p => Math.min(Math.ceil(filtered.length / itemsPerPage), p + 1));
                    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // 2. Buyer Orders View
  const BuyerDashboardView = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
      fetch(`/api/buyer/${currentUser?.id}/dashboard`).then(res => res.json()).then(setStats);
    }, []);

    if (!stats) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">My Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl"><DollarSign size={24} /></div>
            <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Spent</p><p className="text-3xl font-extrabold text-slate-900">${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl"><Package size={24} /></div>
            <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Orders</p><p className="text-3xl font-extrabold text-slate-900">{stats.totalOrders}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-rose-100 text-rose-600 rounded-xl"><Heart size={24} /></div>
            <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Wishlist Items</p><p className="text-3xl font-extrabold text-slate-900">{stats.wishlistCount}</p></div>
          </div>
        </div>

        {/* Spending Trend Chart */}
        {stats.spendingTrend && stats.spendingTrend.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-indigo-500" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Spending Trend</h3>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.spendingTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpending)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold mb-4 text-slate-900">Recent Orders</h3>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {stats.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No recent orders found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-700">Order ID</th>
                  <th className="p-4 font-bold text-slate-700">Date</th>
                  <th className="p-4 font-bold text-slate-700">Total</th>
                  <th className="p-4 font-bold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">#{order.id}</td>
                    <td className="p-4 text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-slate-900">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  const BuyerOrdersView = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(`/api/buyer/${currentUser.id}/orders`).then(res => res.json()).then(data => { setOrders(data); setLoading(false); });
    }, []);

    if (loading) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    const getStatusStep = (status: string) => {
      if (status === 'Processing') return 1;
      if (status === 'Shipped') return 2;
      if (status === 'Delivered') return 3;
      return 0;
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">My Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100"><Package className="mx-auto text-slate-300 mb-4" size={48} /><p className="text-slate-500 text-lg">You haven't placed any orders yet.</p><button onClick={() => setCurrentView('shop')} className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-600 transition-colors">Start Shopping</button></div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => {
              const step = getStatusStep(order.status);
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                    <div><p className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Order Placed</p><p className="font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString()}</p></div>
                    <div><p className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Total</p><p className="font-bold text-slate-900">${order.total.toFixed(2)}</p></div>
                    <div><p className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Order ID</p><p className="font-mono text-sm font-bold text-slate-900">#{order.id.toString().padStart(4, '0')}</p></div>
                  </div>
                  
                  {/* Visual Timeline */}
                  <div className="px-6 py-8 border-b border-slate-100">
                    <div className="relative max-w-2xl mx-auto">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full"></div>
                      <div className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
                      
                      <div className="relative flex justify-between">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-white ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            <Box size={14} />
                          </div>
                          <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>Processing</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-white ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            <Truck size={14} />
                          </div>
                          <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>Shipped</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-white ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            <CheckCircle2 size={14} />
                          </div>
                          <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${step >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>Delivered</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                        <div className="flex-1"><p className="font-bold text-slate-900">{item.name}</p><p className="text-sm text-slate-500">Qty: {item.quantity}</p></div>
                        <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 2.5 Buyer Wishlist View
  const BuyerWishlistView = () => {
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(`/api/buyer/${currentUser?.id}/wishlist/products`).then(res => res.json()).then(data => { setWishlistProducts(data); setLoading(false); });
    }, [wishlist]); // Re-fetch when wishlist changes

    if (loading) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">My Wishlist</h2>
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100"><Heart className="mx-auto text-slate-300 mb-4" size={48} /><p className="text-slate-500 text-lg">Your wishlist is empty.</p><button onClick={() => setCurrentView('shop')} className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-600 transition-colors">Discover Gear</button></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map(product => (
              <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">
                <button onClick={(e) => { toggleWishlist(e, product.id); }} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm text-rose-500 hover:scale-110 transition-transform"><Heart size={18} fill="currentColor" /></button>
                <div className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer" onClick={() => { setSelectedProductId(product.id); setCurrentView('product_details'); }}>
                  <img src={product.image} alt={product.name} className={`w-full h-full object-cover object-center transition-transform duration-500 ${product.stock > 0 ? 'group-hover:scale-105' : 'opacity-50 grayscale'}`} referrerPolicy="no-referrer" />
                  
                  {/* Quick View Button */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); setIsQuickViewOpen(true); }}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
                    >
                      <Eye size={18} /> Quick View
                    </button>
                  </div>

                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-700 uppercase tracking-wider shadow-sm">{product.category}</span>
                    {product.stock === 0 && <span className="bg-rose-500/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-white uppercase tracking-wider shadow-sm">Out of Stock</span>}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight cursor-pointer hover:text-indigo-600 line-clamp-1" onClick={() => { setSelectedProductId(product.id); setCurrentView('product_details'); }}>{product.name}</h3>
                    <p className="text-lg font-bold text-indigo-600 ml-4">${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={Math.round(product.average_rating)} />
                    <span className="text-xs text-slate-500 font-medium">({product.review_count})</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedVendorId(product.vendor_id); setCurrentView('vendor_storefront'); }} className="text-xs text-slate-400 mb-3 font-medium hover:text-indigo-600 transition-colors text-left flex items-center gap-1">
                    Sold by {product.vendor_name}
                    {product.vendor_kyc_status === 'verified' && <CheckCircle2 size={12} className="text-blue-500" />}
                  </button>
                  {currentUser?.role === 'buyer' && (
                    <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} disabled={product.stock === 0} className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md mt-auto ${product.stock > 0 ? 'bg-slate-900 text-white hover:bg-indigo-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                      <ShoppingCart size={18} /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 3. Vendor Dashboard View
  const VendorDashboardView = () => {
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    
    useEffect(() => { 
      fetch(`/api/vendor/${currentUser.id}/dashboard`).then(res => res.json()).then(setStats);
      fetch(`/api/vendor/${currentUser.id}/chart`).then(res => res.json()).then(setChartData);
    }, []);

    if (!stats) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">Store Overview</h2>

        {/* KYC Verification Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Identity Verification</h3>
          {currentUser?.kyc_status === 'verified' ? (
            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <CheckCircle2 size={24} />
              <div>
                <p className="font-bold">Identity Verified</p>
                <p className="text-sm text-emerald-700">Your vendor profile is verified. You have a verified badge on your storefront.</p>
              </div>
            </div>
          ) : currentUser?.kyc_status === 'pending' ? (
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
              <Activity size={24} />
              <div>
                <p className="font-bold">Verification Pending</p>
                <p className="text-sm text-amber-700">Your documents are being reviewed by an admin.</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-slate-600 mb-4">Verify your identity to get a verified badge and build trust with buyers.</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const documentUrl = formData.get('documentUrl');
                const res = await fetch(`/api/vendor/${currentUser?.id}/kyc`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ documentUrl })
                });
                if (res.ok) {
                  showToast('KYC documents submitted successfully');
                  // Update local user state to reflect pending status
                  setCurrentUser(prev => prev ? { ...prev, kyc_status: 'pending' } : null);
                } else {
                  showToast('Failed to submit documents', 'error');
                }
              }} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Document URL (Mock Upload)</label>
                  <input required name="documentUrl" type="url" placeholder="https://example.com/my-id-card.jpg" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-colors">Submit for Verification</button>
              </form>
              {currentUser?.kyc_status === 'rejected' && <p className="text-rose-600 text-sm mt-2 font-medium">Your previous submission was rejected. Please try again.</p>}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={24} /></div>
            <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Revenue</p><p className="text-3xl font-extrabold text-slate-900">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-xl"><Package size={24} /></div>
            <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Active Products</p><p className="text-3xl font-extrabold text-slate-900">{stats.totalProducts}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-xl"><Activity size={24} /></div>
            <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Recent Sales</p><p className="text-3xl font-extrabold text-slate-900">{stats.recentSales.length}</p></div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-emerald-500" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Revenue Trend (Last 7 Days)</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">Recent Sales Activity</h3></div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-medium text-slate-600 text-sm">Product</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Buyer</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Qty</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Price</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Date</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSales.map((sale: any, i: number) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">{sale.product_name}</td>
                  <td className="p-4 text-sm text-slate-600">{sale.buyer_name}</td>
                  <td className="p-4 text-sm text-slate-600">{sale.quantity}</td>
                  <td className="p-4 font-medium text-slate-900">${sale.price.toFixed(2)}</td>
                  <td className="p-4 text-sm text-slate-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{sale.status}</span></td>
                </tr>
              ))}
              {stats.recentSales.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No recent sales found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 4. Vendor Products View
  const VendorProductsView = () => {
    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Form states for multiple images and video
    const [image1, setImage1] = useState('');
    const [image2, setImage2] = useState('');
    const [image3, setImage3] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    
    // AI Generated states
    const [aiDescription, setAiDescription] = useState('');
    const [aiCategory, setAiCategory] = useState('');

    const fetchMyProducts = () => {
      fetch(`/api/vendor/${currentUser?.id}/products`).then(res => res.json()).then(setMyProducts);
    };
    useEffect(() => { fetchMyProducts(); }, []);

    useEffect(() => {
      if (editingProduct) {
        setImage1(editingProduct.image || '');
        setImage2(editingProduct.image2 || '');
        setImage3(editingProduct.image3 || '');
        setVideoUrl(editingProduct.video_url || '');
        setAiDescription(editingProduct.description || '');
        setAiCategory(editingProduct.category || '');
      } else {
        setImage1('');
        setImage2('');
        setImage3('');
        setVideoUrl('');
        setAiDescription('');
        setAiCategory('');
      }
    }, [editingProduct]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setter(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleAIGenerate = async (productName: string) => {
      if (!productName) {
        showToast('Please enter a product name first', 'error');
        return;
      }
      setIsGeneratingAI(true);
      try {
        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate a modernized, advanced, and professional product description and suggest a single-word category for a product named "${productName}". Return the result as JSON with "description" and "category" keys.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ["description", "category"]
            }
          }
        });
        
        const result = JSON.parse(response.text || '{}');
        if (result.description) setAiDescription(result.description);
        if (result.category) setAiCategory(result.category);
        showToast('AI content generated!', 'success');
      } catch (error) {
        console.error('AI Generation error:', error);
        showToast('Failed to generate AI content', 'error');
      } finally {
        setIsGeneratingAI(false);
      }
    };

    const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name'), 
        price: Number(formData.get('price')), 
        category: formData.get('category'),
        image: image1,
        image2: image2,
        image3: image3,
        video_url: videoUrl,
        description: formData.get('description'), 
        stock: Number(formData.get('stock'))
      };
      const res = await fetch(`/api/vendor/${currentUser?.id}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (res.ok) { showToast('Product added successfully!'); setIsAdding(false); fetchMyProducts(); }
    };

    const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name'), 
        price: Number(formData.get('price')), 
        category: formData.get('category'),
        image: image1,
        image2: image2,
        image3: image3,
        video_url: videoUrl,
        description: formData.get('description'), 
        stock: Number(formData.get('stock'))
      };
      const res = await fetch(`/api/vendor/${currentUser?.id}/products/${editingProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (res.ok) { showToast('Product updated successfully!'); setEditingProduct(null); fetchMyProducts(); }
    };

    const handleDeleteProduct = async (productId: number) => {
      if (!confirm('Are you sure you want to delete this product?')) return;
      const res = await fetch(`/api/vendor/${currentUser?.id}/products/${productId}`, { method: 'DELETE' });
      if (res.ok) { showToast('Product deleted successfully!'); fetchMyProducts(); }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">My Products</h2>
          <button onClick={() => { setIsAdding(true); setEditingProduct(null); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"><PlusCircle size={20} /> Add Product</button>
        </div>

        {(isAdding || editingProduct) && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3><button onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="text-slate-400 hover:text-slate-900"><X size={20} /></button></div>
            <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input required name="name" id="product_name_input" type="text" defaultValue={editingProduct?.name} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label><input required name="price" type="number" step="0.01" defaultValue={editingProduct?.price} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty</label><input required name="stock" type="number" defaultValue={editingProduct?.stock ?? 10} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><input required name="category" type="text" value={aiCategory} onChange={(e) => setAiCategory(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image 1 (Main)</label>
                  <div className="flex flex-col gap-2">
                    {image1 && <img src={image1} className="w-full h-24 object-cover rounded-lg border" />}
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2">
                      <Upload size={16} /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setImage1)} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image 2</label>
                  <div className="flex flex-col gap-2">
                    {image2 && <img src={image2} className="w-full h-24 object-cover rounded-lg border" />}
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2">
                      <Upload size={16} /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setImage2)} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image 3</label>
                  <div className="flex flex-col gap-2">
                    {image3 && <img src={image3} className="w-full h-24 object-cover rounded-lg border" />}
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2">
                      <Upload size={16} /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setImage3)} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Video (Optional)</label>
                <div className="flex flex-col gap-2">
                  {videoUrl && <video src={videoUrl} className="w-full h-32 object-cover rounded-lg border" controls />}
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2">
                    <Video size={16} /> Upload Video
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, setVideoUrl)} />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <button 
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('product_name_input') as HTMLInputElement;
                      handleAIGenerate(input.value);
                    }}
                    disabled={isGeneratingAI}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingAI ? <Sparkles className="animate-pulse" size={14} /> : <Sparkles size={14} />}
                    AI Generate Professional Description
                  </button>
                </div>
                <textarea required name="description" rows={3} value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
              </div>
              <div className="md:col-span-2 flex justify-end"><button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-colors">{editingProduct ? 'Update Product' : 'Save Product'}</button></div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {myProducts.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col relative group">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => { setEditingProduct(p); setIsAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 bg-white rounded-full shadow hover:text-indigo-600"><Settings size={16} /></button>
                <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-white rounded-full shadow hover:text-rose-600"><Trash2 size={16} /></button>
              </div>
              <div className="relative aspect-square">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                {(p.image2 || p.image3 || p.video_url) && (
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {p.image2 && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                    {p.image3 && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                    {p.video_url && <Video size={12} className="text-white drop-shadow" />}
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-900">{p.name}</h4><p className="font-bold text-emerald-600">${p.price.toFixed(2)}</p></div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{p.category}</p>
                  <p className="text-xs font-bold text-slate-500">Stock: {p.stock}</p>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mt-auto">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 4.5 Vendor Storefront View
  const VendorStorefrontView = () => {
    const [vendor, setVendor] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVendorData = () => {
      if (selectedVendorId) {
        Promise.all([
          fetch(`/api/public/vendor/${selectedVendorId}`).then(res => res.json()),
          fetch(`/api/vendor/${selectedVendorId}/products`).then(res => res.json())
        ]).then(([vendorData, productsData]) => {
          setVendor(vendorData);
          setProducts(productsData);
          setLoading(false);
        });
      }
    };

    useEffect(() => {
      fetchVendorData();
    }, [selectedVendorId]);

    if (loading) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!vendor) return <div className="text-center py-32 text-slate-500">Vendor not found.</div>;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => setCurrentView('shop')} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          <ChevronRight size={20} className="rotate-180" /> Back to Shop
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-12">
          <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
            <div className="absolute -bottom-12 left-8">
              <img src={vendor.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Vendor"} alt={vendor.name} className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md" />
            </div>
          </div>
          <div className="pt-16 pb-8 px-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              {vendor.name}
              {vendor.kyc_status === 'verified' && <CheckCircle2 size={28} className="text-blue-500 fill-blue-50" />}
            </h1>
            <p className="text-slate-500 flex items-center gap-2">
              {vendor.kyc_status === 'verified' ? (
                <span className="flex items-center gap-1 text-blue-600 font-medium"><Award size={16} /> Verified Vendor</span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400"><Award size={16} /> Unverified Vendor</span>
              )}
              • Joined {new Date(vendor.created_at).toLocaleDateString()}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(vendor.average_rating)} />
                <span className="text-sm font-bold text-slate-900 ml-1">{vendor.average_rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-slate-500 font-medium">({vendor.review_count} Storefront Reviews)</span>
              
              {currentUser && currentUser.id !== vendor.id && (
                <button 
                  onClick={() => { setActiveChatUserId(vendor.id); setIsChatOpen(true); }}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
                >
                  <MessageSquare size={18} /> Chat with Vendor
                </button>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">Products by {vendor.name}</h2>
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100"><Package className="mx-auto text-slate-300 mb-4" size={48} /><p className="text-slate-500 text-lg">No products available yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={p.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 relative cursor-pointer" onClick={() => { setSelectedProductId(p.id); setCurrentView('product_details'); }}>
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  {p.stock === 0 && <span className="absolute top-3 left-3 bg-rose-500/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-white uppercase tracking-wider shadow-sm">Out of Stock</span>}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-1">{p.name}</h3>
                    <p className="text-lg font-bold text-indigo-600 ml-4">${p.price.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{p.category}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(p); setIsCartOpen(true); }} 
                    disabled={p.stock === 0}
                    className={`mt-auto w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md ${p.stock > 0 ? 'bg-slate-900 text-white hover:bg-indigo-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <ShoppingCart size={18} /> {p.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <VendorReviews vendorId={vendor.id} onReviewSubmitted={fetchVendorData} />
      </div>
    );
  };

  // 5. Admin Dashboard View
  const AdminDashboardView = () => {
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => { 
      fetch('/api/admin/dashboard').then(res => res.json()).then(setStats); 
      fetch('/api/admin/chart').then(res => res.json()).then(setChartData);
    }, []);

    const updateStatus = async (id: number, status: string) => {
      await fetch(`/api/admin/orders/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      setStats({ ...stats, recentOrders: stats.recentOrders.map((o: any) => o.id === id ? { ...o, status } : o) });
      showToast('Order status updated');
    };

    if (!stats) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div></div>;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">Platform Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-rose-100 text-rose-600 rounded-xl"><DollarSign size={24} /></div>
            <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Platform Revenue</p><p className="text-3xl font-extrabold text-slate-900">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl"><Users size={24} /></div>
            <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Registered Users</p><p className="text-3xl font-extrabold text-slate-900">{stats.totalUsers}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-100 text-amber-600 rounded-xl"><Box size={24} /></div>
            <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Orders Placed</p><p className="text-3xl font-extrabold text-slate-900">{stats.totalOrders}</p></div>
          </div>
        </div>

        {/* Platform Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-rose-500" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Platform Revenue Trend</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorAdminRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">Recent Platform Orders</h3></div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-medium text-slate-600 text-sm">Order ID</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Buyer</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Total</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Date</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Status</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-mono text-sm">#{order.id.toString().padStart(4, '0')}</td>
                  <td className="p-4"><p className="font-medium text-slate-900">{order.buyer_name}</p><p className="text-xs text-slate-500">{order.buyer_email}</p></td>
                  <td className="p-4 font-bold">${order.total.toFixed(2)}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{order.status}</span></td>
                  <td className="p-4">
                    <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-rose-500">
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 6. Admin Users View
  const AdminUsersView = () => {
    const [users, setUsers] = useState<any[]>([]);
    const fetchUsers = () => fetch('/api/admin/users').then(res => res.json()).then(setUsers);
    useEffect(() => { fetchUsers(); }, []);

    const handleDeleteUser = async (id: number) => {
      if (!confirm('Are you sure you want to delete this user?')) return;
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('User deleted successfully'); fetchUsers(); }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">User Management</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-medium text-slate-600 text-sm">ID</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Name</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Email</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Role</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Joined</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-mono text-sm">{u.id}</td>
                  <td className="p-4 font-medium text-slate-900">{u.name}</td>
                  <td className="p-4 text-sm text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : u.role === 'vendor' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{u.role}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    {u.id !== currentUser?.id && (
                      <button onClick={() => handleDeleteUser(u.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 6.5 Admin KYC View
  const AdminKYCView = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const fetchRequests = () => fetch('/api/admin/kyc').then(res => res.json()).then(setRequests);
    useEffect(() => { fetchRequests(); }, []);

    const handleUpdateStatus = async (id: number, status: 'verified' | 'rejected') => {
      const res = await fetch(`/api/admin/kyc/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`User ${status} successfully`);
        fetchRequests();
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">KYC Verification Requests</h2>
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200"><CheckCircle2 className="mx-auto text-slate-300 mb-4" size={48} /><p className="text-slate-500 text-lg">No pending verification requests.</p></div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-medium text-slate-600 text-sm">Vendor</th>
                  <th className="p-4 font-medium text-slate-600 text-sm">Email</th>
                  <th className="p-4 font-medium text-slate-600 text-sm">Document</th>
                  <th className="p-4 font-medium text-slate-600 text-sm">Submitted</th>
                  <th className="p-4 font-medium text-slate-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((u: any) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full bg-slate-200" />
                      <span className="font-medium text-slate-900">{u.name}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{u.email}</td>
                    <td className="p-4 text-sm text-indigo-600"><a href={u.kyc_document} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1"><Tag size={14} /> View Document</a></td>
                    <td className="p-4 text-sm text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleUpdateStatus(u.id, 'verified')} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors">Approve</button>
                      <button onClick={() => handleUpdateStatus(u.id, 'rejected')} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-rose-200 transition-colors">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // 7. Admin Products View
  // 6. Admin Products View
  const AdminProductsView = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

    const fetchProducts = () => fetch('/api/admin/products').then(res => res.json()).then(setProducts);
    useEffect(() => { fetchProducts(); }, []);

    const handleDeleteProduct = async (id: number) => {
      if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Product deleted successfully'); fetchProducts(); }
    };

    const toggleSelect = (id: number) => {
      const newSelected = new Set(selectedProducts);
      if (newSelected.has(id)) newSelected.delete(id);
      else newSelected.add(id);
      setSelectedProducts(newSelected);
    };

    const toggleSelectAll = () => {
      if (selectedProducts.size === products.length) setSelectedProducts(new Set());
      else setSelectedProducts(new Set(products.map(p => p.id)));
    };

    const handleBulkDelete = async () => {
      if (!confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) return;
      const res = await fetch('/api/admin/products/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: Array.from(selectedProducts) })
      });
      if (res.ok) {
        showToast(`${selectedProducts.size} products deleted successfully`);
        setSelectedProducts(new Set());
        fetchProducts();
      }
    };

    const handleBulkFeature = async (isFeatured: boolean) => {
      const res = await fetch('/api/admin/products/bulk-feature', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: Array.from(selectedProducts), isFeatured })
      });
      if (res.ok) {
        showToast(`${selectedProducts.size} products updated successfully`);
        setSelectedProducts(new Set());
        fetchProducts();
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Product Management</h2>
          {selectedProducts.size > 0 && (
            <div className="flex gap-2">
              <button onClick={() => handleBulkFeature(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Feature Selected</button>
              <button onClick={() => handleBulkFeature(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors">Unfeature Selected</button>
              <button onClick={handleBulkDelete} className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors">Delete Selected</button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10">
                  <input type="checkbox" checked={products.length > 0 && selectedProducts.size === products.length} onChange={toggleSelectAll} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="p-4 font-medium text-slate-600 text-sm">ID</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Product</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Vendor</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Price</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Stock</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Featured</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className={`border-b border-slate-100 hover:bg-slate-50 ${selectedProducts.has(p.id) ? 'bg-indigo-50' : ''}`}>
                  <td className="p-4">
                    <input type="checkbox" checked={selectedProducts.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>
                  <td className="p-4 font-mono text-sm">{p.id}</td>
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                    <span className="font-medium text-slate-900 line-clamp-1">{p.name}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{p.vendor_name}</td>
                  <td className="p-4 font-medium">${p.price.toFixed(2)}</td>
                  <td className="p-4 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{p.stock}</span></td>
                  <td className="p-4 text-sm">
                    {p.is_featured ? <span className="text-amber-500 font-bold text-xs px-2 py-1 bg-amber-100 rounded-full">Featured</span> : <span className="text-slate-400 text-xs">No</span>}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 7.1 Vendor Orders View
  const VendorOrdersView = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => {
      fetch(`/api/vendor/${currentUser?.id}/orders`)
        .then(res => res.json())
        .then(data => { setOrders(data); setLoading(false); });
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusUpdate = async (orderId: number, status: string) => {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast('Order status updated');
        fetchOrders();
      }
    };

    if (loading) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">Store Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100"><Package className="mx-auto text-slate-300 mb-4" size={48} /><p className="text-slate-500 text-lg">You have no orders yet.</p></div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                  <div><p className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Order ID</p><p className="font-mono text-sm font-bold text-slate-900">#{order.id.toString().padStart(4, '0')}</p></div>
                  <div><p className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Date</p><p className="font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString()}</p></div>
                  <div><p className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Buyer</p><p className="font-bold text-slate-900">{order.buyer_name}</p><p className="text-xs text-slate-500">{order.buyer_email}</p></div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Status</p>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={`text-sm font-bold px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer ${order.status === 'Processing' ? 'bg-amber-100 text-amber-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
                <div className="p-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                        <th className="pb-3 font-medium">Item</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">Qty</th>
                        <th className="pb-3 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-4 flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                            <span className="font-medium text-slate-900">{item.name}</span>
                          </td>
                          <td className="py-4 font-medium text-slate-600">${item.price.toFixed(2)}</td>
                          <td className="py-4 font-medium text-slate-600">{item.quantity}</td>
                          <td className="py-4 font-bold text-slate-900 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 7.2 Admin Orders View
  const AdminOrdersView = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => {
      fetch('/api/admin/orders')
        .then(res => res.json())
        .then(data => { setOrders(data); setLoading(false); });
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusUpdate = async (orderId: number, status: string) => {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast('Order status updated');
        fetchOrders();
      }
    };

    if (loading) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">All Orders</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-medium text-slate-600 text-sm">Order ID</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Date</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Buyer</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Total</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-mono text-sm font-bold">#{order.id.toString().padStart(4, '0')}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{order.buyer_name}</p>
                    <p className="text-xs text-slate-500">{order.buyer_email}</p>
                  </td>
                  <td className="p-4 font-bold text-slate-900">${order.total.toFixed(2)}</td>
                  <td className="p-4">
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer ${order.status === 'Processing' ? 'bg-amber-100 text-amber-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 9. Product Detail View
  const ProductDetailView = () => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (selectedProductId) {
        fetch(`/api/products`)
          .then(res => res.json())
          .then(data => {
            const found = data.find((p: Product) => p.id === selectedProductId);
            setProduct(found || null);
            setLoading(false);
          });
      }
    }, [selectedProductId]);

    if (loading) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!product) return <div className="text-center py-32 text-slate-500">Product not found.</div>;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => setCurrentView('shop')} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          <ChevronRight size={20} className="rotate-180" /> Back to Shop
        </button>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row mb-12">
          <div className="md:w-1/2 bg-slate-100 relative min-h-[400px]">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover absolute inset-0" />
          </div>
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">{product.category}</span>
              <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <StarRating rating={Math.round(product.average_rating)} />
              <span className="text-sm text-slate-500">{product.average_rating.toFixed(1)} ({product.review_count} reviews)</span>
            </div>
            <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
              Sold by 
              <button onClick={() => { setSelectedVendorId(product.vendor_id); setCurrentView('vendor_storefront'); }} className="font-medium text-slate-700 hover:text-indigo-600 underline decoration-slate-300 hover:decoration-indigo-600 transition-all flex items-center gap-1">
                {product.vendor_name}
                {product.vendor_kyc_status === 'verified' && <CheckCircle2 size={14} className="text-blue-500" />}
              </button>
            </p>
            <div className="flex items-center gap-4 mb-8">
              <p className="text-4xl font-light text-slate-900">${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              {product.stock > 0 ? (
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold uppercase tracking-wider rounded-full">In Stock ({product.stock})</span>
              ) : (
                <span className="px-4 py-1.5 bg-rose-100 text-rose-700 text-sm font-bold uppercase tracking-wider rounded-full">Out of Stock</span>
              )}
            </div>
            <p className="text-slate-600 text-lg leading-relaxed mb-10 flex-1">{product.description}</p>
            
            <div className="flex gap-4 mb-10">
              <button 
                onClick={() => { addToCart(product); setIsCartOpen(true); }} 
                disabled={product.stock === 0}
                className={`flex-1 font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-lg ${product.stock > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                <ShoppingCart size={24} /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              {currentUser && currentUser.id !== product.vendor_id && (
                <button 
                  onClick={() => { setActiveChatUserId(product.vendor_id); setIsChatOpen(true); }}
                  className="px-6 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare size={24} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Customer Reviews</h2>
          <QuickViewReviews product={product} />
        </div>
      </div>
    );
  };

  // 8. User Settings View
  // Removed inline SettingsView component

  const ChatSystem = () => {
    const [messageText, setMessageText] = useState('');
    const scrollRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [chatMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!messageText.trim() || !activeChatUserId || !chatSocket) return;

      chatSocket.send(JSON.stringify({
        type: 'chat',
        senderId: currentUser?.id,
        receiverId: activeChatUserId,
        text: messageText
      }));
      setMessageText('');
    };

    if (!isChatOpen) return (
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all z-[60] group"
      >
        <MessageSquare size={28} />
        {unreadChatCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
            {unreadChatCount}
          </span>
        )}
      </button>
    );

    return (
      <div className="fixed bottom-8 right-8 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-[60] overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            {activeChatUserId ? (
              <button onClick={() => setActiveChatUserId(null)} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <ChevronLeft size={20} />
              </button>
            ) : (
              <MessageSquare size={20} className="text-indigo-400" />
            )}
            <h3 className="font-bold">
              {activeChatUserId 
                ? conversations.find(c => c.other_user_id === activeChatUserId)?.other_user_name || 'Chat'
                : 'Conversations'}
            </h3>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {!activeChatUserId ? (
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Mail className="mx-auto mb-2 opacity-20" size={48} />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button 
                    key={conv.other_user_id}
                    onClick={() => setActiveChatUserId(conv.other_user_id)}
                    className="w-full p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all text-left group"
                  >
                    <img src={conv.other_user_avatar} alt="" className="w-12 h-12 rounded-full bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-slate-900 truncate">{conv.other_user_name}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(conv.last_message_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4" ref={scrollRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender_id === currentUser?.id 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.message}
                    <p className={`text-[10px] mt-1 opacity-60 ${msg.sender_id === currentUser?.id ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeChatUserId && (
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
              <ArrowRight size={20} />
            </button>
          </form>
        )}
      </div>
    );
  };

  // --- Cart & Checkout Handlers ---
  const addToCart = (product: Product) => {
    if (!currentUser) {
      setAuthMode('login');
      setAuthRole('buyer');
      setIsAuthOpen(true);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean) as any[]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const orderData = { buyer_id: currentUser.id, address: formData.get('address'), items: cart, total: cartTotal };

    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
      const data = await res.json();
      if (data.success) { setCart([]); setIsCheckoutOpen(false); setIsCartOpen(false); showToast('Order placed successfully!', 'success'); setCurrentView('buyer_orders'); } 
      else showToast('Checkout failed.', 'error');
    } catch (err) { showToast('An error occurred during checkout.', 'error'); }
  };

  // --- Layout Render ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar Navigation */}
      {currentUser && (
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
          <Moon size={28} className="text-indigo-400" />
          <span className="font-bold text-2xl tracking-tight">Moonshop</span>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto md:hidden text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <img src={currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} alt="Avatar" className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700" />
          <div>
            <p className="font-bold text-white text-sm line-clamp-1">{currentUser?.name || "Guest User"}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{currentUser?.role || "Visitor"}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('menu')}</p>
          
          {/* Public Links */}
          <button onClick={() => {setCurrentView('shop'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'shop' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><ShoppingCart size={20} /> {t('shop_gear')}</button>
          {!currentUser && (
            <button 
              onClick={() => {
                setAuthMode('signup');
                setAuthRole('vendor');
                setIsAuthOpen(true);
                setIsSidebarOpen(false);
              }} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors bg-indigo-900/50 text-indigo-100 hover:bg-indigo-800"
            >
              <Zap size={20} className="text-yellow-400" /> {t('become_seller')}
            </button>
          )}

          {/* Buyer Links */}
          {currentUser && currentUser.role === 'buyer' && (
            <>
              <button onClick={() => {setCurrentView('buyer_dashboard'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'buyer_dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={20} /> {t('dashboard')}</button>
              <button onClick={() => {setCurrentView('buyer_orders'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'buyer_orders' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Package size={20} /> {t('my_orders')}</button>
              <button onClick={() => {setCurrentView('buyer_wishlist'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'buyer_wishlist' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Heart size={20} /> {t('wishlist')}</button>
            </>
          )}

          {/* Vendor Links */}
          {currentUser?.role === 'vendor' && (
            <>
              <button onClick={() => {setCurrentView('vendor_dashboard'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'vendor_dashboard' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={20} /> {t('dashboard')}</button>
              <button onClick={() => {setCurrentView('vendor_products'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'vendor_products' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Tag size={20} /> {t('my_products')}</button>
              <button onClick={() => {setCurrentView('vendor_orders'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'vendor_orders' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Package size={20} /> {t('store_orders')}</button>
            </>
          )}

          {/* Admin Links */}
          {currentUser?.role === 'admin' && (
            <>
              <button onClick={() => {setCurrentView('admin_dashboard'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'admin_dashboard' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={20} /> {t('platform_overview')}</button>
              <button onClick={() => {setCurrentView('admin_products'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'admin_products' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Box size={20} /> {t('products')}</button>
              <button onClick={() => {setCurrentView('admin_users'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'admin_users' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Users size={20} /> {t('users')}</button>
              <button onClick={() => {setCurrentView('admin_kyc'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'admin_kyc' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Award size={20} /> {t('kyc_requests')}</button>
              <button onClick={() => {setCurrentView('admin_orders'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'admin_orders' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Package size={20} /> {t('all_orders')}</button>
            </>
          )}

          {/* Common Links */}
          {currentUser && (
            <button onClick={() => {setCurrentView('settings'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'settings' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Settings size={20} /> {t('settings')}</button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          {currentUser ? (
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><LogOut size={20} /> {t('sign_out')}</button>
          ) : (
            <button onClick={() => { setAuthMode('login'); setAuthRole('buyer'); setIsAuthOpen(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-bold justify-center">{t('sign_in')}</button>
          )}
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            {currentUser ? (
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-900"><Menu size={24} /></button>
            ) : (
              <div className="flex items-center gap-2 text-indigo-600 mr-4">
                <Moon size={24} />
                <span className="font-bold text-xl tracking-tight text-slate-900">Moonshop</span>
              </div>
            )}
            {currentView === 'shop' && (
              <div className="hidden sm:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder={t('search_placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all text-slate-600 font-medium text-sm"
              >
                <Globe size={18} />
                <span className="uppercase">{language}</span>
                <ChevronDown size={14} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                  >
                    <button onClick={() => { setLanguage('en'); setIsLangOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${language === 'en' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}>
                      English {language === 'en' && <CheckCircle2 size={14} />}
                    </button>
                    <button onClick={() => { setLanguage('am'); setIsLangOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${language === 'am' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}>
                      አማርኛ {language === 'am' && <CheckCircle2 size={14} />}
                    </button>
                    <button onClick={() => { setLanguage('om'); setIsLangOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${language === 'om' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}>
                      Afaan Oromoo {language === 'om' && <CheckCircle2 size={14} />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!currentUser && (
              <button 
                onClick={() => {
                  setAuthMode('signup');
                  setAuthRole('vendor');
                  setIsAuthOpen(true);
                }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                <Zap size={16} className="text-indigo-600" /> {t('become_seller')}
              </button>
            )}
            {currentUser && (
              <div className="relative">
                <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors relative" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                  <Bell size={24} />
                  {notifications.filter(n => !n.is_read).length > 0 && <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">{notifications.filter(n => !n.is_read).length}</span>}
                </button>
                <AnimatePresence>
                  {isNotificationsOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">{t('notifications_title')}</h3>
                      <button onClick={() => {
                        fetch(`/api/users/${currentUser.id}/notifications/read-all`, { method: 'PUT' }).then(() => fetchNotifications());
                      }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">{t('mark_all_read')}</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">{t('no_notifications')}</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => {
                            if (!n.is_read) {
                              fetch(`/api/notifications/${n.id}/read`, { method: 'PUT' }).then(() => fetchNotifications());
                            }
                          }} className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${n.is_read ? 'opacity-60' : 'bg-indigo-50/30'}`}>
                            <p className="text-sm text-slate-800">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {currentUser ? (
              currentUser.role === 'buyer' && (
                <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors relative" onClick={() => setIsCartOpen(true)}>
                  <ShoppingCart size={24} />
                  {cartCount > 0 && <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
                </button>
              )
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { setAuthMode('login'); setAuthRole('buyer'); setIsAuthOpen(true); }} className="text-slate-600 font-bold hover:text-slate-900 px-4 py-2">Sign In</button>
                <button onClick={() => { setAuthMode('signup'); setAuthRole('buyer'); setIsAuthOpen(true); }} className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors">Sign Up</button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {currentView === 'shop' && <ShopView />}
          {currentView === 'product_details' && <ProductDetailView />}
          {currentView === 'vendor_storefront' && <VendorStorefrontView />}

          {currentUser ? (
            <>
              {currentView === 'buyer_dashboard' && currentUser.role === 'buyer' && <BuyerDashboardView />}
              {currentView === 'buyer_orders' && currentUser.role === 'buyer' && <BuyerOrdersView />}
              {currentView === 'buyer_wishlist' && currentUser.role === 'buyer' && <BuyerWishlistView />}
              
              {currentView === 'vendor_dashboard' && currentUser.role === 'vendor' && <VendorDashboardView />}
              {currentView === 'vendor_products' && currentUser.role === 'vendor' && <VendorProductsView />}
              {currentView === 'vendor_orders' && currentUser.role === 'vendor' && <VendorOrdersView />}
              
              {currentView === 'admin_dashboard' && currentUser.role === 'admin' && <AdminDashboardView />}
              {currentView === 'admin_products' && currentUser.role === 'admin' && <AdminProductsView />}
              {currentView === 'admin_orders' && currentUser.role === 'admin' && <AdminOrdersView />}
              {currentView === 'admin_users' && currentUser.role === 'admin' && <AdminUsersView />}
              {currentView === 'admin_kyc' && currentUser.role === 'admin' && <AdminKYCView />}
              
              {currentView === 'settings' && currentUser && (
                <SettingsView 
                  currentUser={currentUser} 
                  onUpdateUser={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    localStorage.setItem('moonshop_user', JSON.stringify(updatedUser));
                  }}
                  showToast={showToast}
                  t={t}
                />
              )}
            </>
          ) : (
            (currentView !== 'shop' && currentView !== 'product_details') && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Lock size={48} className="mb-4 text-slate-300" />
                <p className="mb-6 text-xl font-bold text-slate-700">Access Restricted</p>
                <p className="mb-8 text-slate-500">Please sign in to access this page.</p>
                <button onClick={() => { setAuthMode('login'); setAuthRole('buyer'); setIsAuthOpen(true); }} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Sign In</button>
              </div>
            )
          )}
          <Footer currentUser={currentUser} setCurrentView={setCurrentView} />
        </div>
      </div>

      {/* --- Overlays --- */}
      
      {/* Mobile Sidebar Overlay */}
      {currentUser && isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Quick View Modal */}
      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => { setIsQuickViewOpen(false); setQuickViewProduct(null); }} 
        product={quickViewProduct} 
      />

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={() => setIsCartOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ShoppingCart size={24} /> Your Cart</h2><button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"><X size={20} /></button></div>
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4"><ShoppingCart size={64} className="text-slate-200" /><p className="text-lg font-medium text-slate-600">Your cart is empty</p></div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div><h4 className="font-bold text-slate-900 line-clamp-1">{item.name}</h4><p className="text-indigo-600 font-medium">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-2 py-1"><button onClick={() => updateQuantity(item.id, -1)} className="text-slate-500 hover:text-slate-900"><Minus size={14} /></button><span className="text-sm font-bold w-4 text-center">{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} className="text-slate-500 hover:text-slate-900"><Plus size={14} /></button></div>
                            <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center mb-4"><span className="text-slate-500 font-medium">Subtotal</span><span className="text-2xl font-bold text-slate-900">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                  <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Proceed to Checkout</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIsCheckoutOpen(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><CreditCard size={24} /> Secure Checkout</h2><button onClick={() => setIsCheckoutOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"><X size={20} /></button></div>
                <div className="p-6 overflow-y-auto">
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Shipping Address</label><textarea required name="address" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="1 Space Center Blvd..."></textarea></div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3"><CreditCard className="text-slate-400" /><div className="flex-1"><p className="text-sm font-medium text-slate-900">Credit Card</p><p className="text-xs text-slate-500">Mock payment for demo</p></div><CheckCircle2 className="text-indigo-600" size={20} /></div>
                  </form>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <button form="checkout-form" type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg">Pay ${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {currentUser && <ChatSystem />}

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={(user) => {
          setCurrentUser(user);
          localStorage.setItem('moonshop_user', JSON.stringify(user));
          setDefaultViewForRole(user.role);
          showToast(`Welcome back, ${user.name}!`);
          setIsAuthOpen(false);
          if (user.role === 'buyer') {
            fetch(`/api/buyer/${user.id}/wishlist`).then(r => r.json()).then(setWishlist);
          }
          fetch(`/api/users/${user.id}/notifications`).then(r => r.json()).then(setNotifications);
        }}
        showToast={showToast}
        initialMode={authMode}
        initialRole={authRole}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
            <div className={`px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-medium text-sm border ${toast.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={18} className="text-green-400" /> : <X size={18} />} {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
