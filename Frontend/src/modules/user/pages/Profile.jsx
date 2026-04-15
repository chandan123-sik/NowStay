import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useWallet } from '../../../context/WalletContext';
import { User, Mail, Shield, LogOut, Settings, CreditCard, History, ChevronRight, ChevronLeft, Star, MapPin, Bell, X, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { roomCategories } from '../../../utils/roomData';

const Profile = () => {
    const { user, logout, updateProfile, unreadCount, wishlist, toggleWishlist } = useAuth();
    const { balance, transactions } = useWallet();
    const navigate = useNavigate();

    const [bookingCount, setBookingCount] = useState(0);

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-10 text-center space-y-4 max-w-sm w-full">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <User size={20} className="text-slate-400" />
                    </div>
                    <h2 className="text-lg font-serif text-secondary lowercase">Please sign in</h2>
                    <p className="text-slate-400 text-[11px]">Access your sanctuary profile and bookings.</p>
                    <button onClick={() => navigate('/login')}
                        className="w-full bg-secondary text-white py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all">
                        Sign In Now
                    </button>
                </div>
            </div>
        );
    }

    useEffect(() => {
        if (user) {
            // Fetch fresh user data to ensure profile picture and other info is in sync
            api.get(`/auth/me/${user._id}`).then(res => {
                if (res.data) updateProfile(res.data);
            }).catch(e => console.error(e));

            api.get(`/bookings/my/${user._id}`).then(res => setBookingCount(res.data.length)).catch(e => console.error(e));
        }
    }, [user?._id]);

    const stats = [
        { label: 'Bookings', value: bookingCount },
        { label: 'Wishlist', value: wishlist.length },
        { label: 'Rating', value: '4.9' },
    ];

    const wishlistRoomsData = wishlist.map(idx => ({ ...roomCategories[idx], originalIndex: idx })).filter(r => r.type);

    const menuItems = [
        { name: 'My Bookings', desc: 'View your stays & history', icon: History, path: '/profile/bookings', color: 'text-purple-500 bg-purple-50' },
        { name: 'My Wishlist', desc: 'View your saved curated stays', icon: Heart, path: '/profile/wishlist', color: 'text-rose-500 bg-rose-50' },
        { name: 'Wallet', desc: 'Balance & transactions', icon: CreditCard, path: '/wallet', color: 'text-emerald-500 bg-emerald-50' },
    ];

    const location = useLocation();
    const isWishlistView = location.pathname === '/profile/wishlist';

    if (isWishlistView) {
        return (
            <div className="min-h-screen bg-slate-50 pb-20 md:pb-12 font-sans">
                {/* Wishlist Header */}
                <div className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-50 flex items-center gap-3">
                    <button onClick={() => navigate('/profile')}
                        className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-secondary active:scale-90 transition-all">
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Personal Sanctuary</p>
                        <h1 className="text-sm font-bold text-secondary">My Wishlist</h1>
                    </div>
                </div>

                <div className="px-4 pt-6 space-y-4">
                    {wishlistRoomsData.length > 0 ? (
                        <div className="grid gap-4">
                            {wishlistRoomsData.map((room, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="w-32 h-32 flex-shrink-0 relative">
                                        <img src={room.image} className="w-full h-full object-cover" alt={room.type} />
                                        <button
                                            onClick={() => toggleWishlist(room.originalIndex)}
                                            className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center text-rose-500 shadow-sm"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[7px] font-black text-primary uppercase tracking-widest">{room.category || 'Featured'}</p>
                                                <div className="flex items-center gap-1 text-emerald-600 text-[8px] font-bold">
                                                    <Star size={8} className="fill-emerald-600" /> 4.9
                                                </div>
                                            </div>
                                            <h3 className="text-sm font-bold text-secondary mt-1">{room.type}</h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                                <MapPin size={10} />
                                                <span className="text-[9px]">Ocean View Sanctuary</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between items-end">
                                            <div>
                                                <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">Pricing Starts</p>
                                                <p className="text-secondary font-black text-sm">₹{room.price}</p>
                                            </div>
                                            <button
                                                onClick={() => navigate('/rooms', { state: { initialSearch: room.type } })}
                                                className="bg-secondary text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                <Heart size={24} className="text-slate-200" />
                            </div>
                            <div>
                                <h3 className="text-secondary font-bold text-base">Your wishlist is empty</h3>
                                <p className="text-slate-400 text-[10px] mt-1">Explore our sanctuaries and save your favorites here.</p>
                            </div>
                            <button onClick={() => navigate('/')}
                                className="px-6 py-3 bg-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">
                                Explore Stays
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-28 md:pb-12 overflow-x-hidden font-sans">
            {/* Hero Profile Card */}
            <div className="relative bg-secondary overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, #c9a84c 0%, transparent 40%), radial-gradient(circle at 90% 10%, #c9a84c 0%, transparent 40%)' }} />

                <div className="relative z-10 px-6 pt-8 pb-16">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-serif text-xl font-bold overflow-hidden">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name[0]
                                )}
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-lg leading-tight">{user.name}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[8px] font-bold uppercase tracking-widest">
                                        <Shield size={8} className="fill-emerald-400/20" /> {user.role} Member
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <Mail size={10} className="text-white/40" />
                                    <span className="text-white/40 text-[8px] font-medium tracking-wide">{user.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/profile/details')} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all">
                                <Settings size={18} />
                            </button>
                            <button onClick={() => navigate('/notifications')} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all relative">
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mt-6 bg-white/5 border border-white/5 rounded-xl p-3">
                        {stats.map(({ label, value }) => (
                            <div key={label} className="text-center">
                                <p className="text-white font-bold text-base">{value}</p>
                                <p className="text-white/30 text-[7px] font-bold uppercase tracking-widest mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu below hero */}
            <div className="px-4 -mt-10 relative z-10 space-y-3">
                {/* Loyalty Card */}
                <div className="bg-white rounded-xl shadow-xl border border-slate-50 p-4 sticky top-4 overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[7px] font-bold text-primary uppercase tracking-widest">Ananya Loyalty</p>
                            <p className="text-secondary font-serif text-sm mt-0.5 lowercase capitalize">Gold Tier Member</p>
                        </div>
                    </div>
                </div>

                {/* Wishlist Section */}
                {wishlistRoomsData.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                                <Heart size={10} className="fill-rose-500 text-rose-500" />
                                My Wishlist
                            </h3>
                            <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{wishlistRoomsData.length} Items</span>
                        </div>
                        <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2 snap-x">
                            {wishlistRoomsData.map((room, idx) => (
                                <div key={idx} className="flex-shrink-0 w-32 bg-white rounded-xl border border-slate-50 shadow-sm overflow-hidden snap-start relative group">
                                    <button
                                        onClick={() => toggleWishlist(room.originalIndex)}
                                        className="absolute top-1.5 right-1.5 z-10 w-5 h-5 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-rose-500 shadow-sm active:scale-75 transition-all"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                    <div className="h-20 overflow-hidden">
                                        <img src={room.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={room.type} />
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <p className="text-[8px] font-bold text-secondary truncate uppercase italic">{room.type}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-primary font-bold text-[9px]">₹{room.price}</p>
                                            <button
                                                onClick={() => navigate('/rooms', { state: { initialSearch: room.type } })}
                                                className="bg-secondary text-white text-[7px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter"
                                            >
                                                Go
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Menu Items */}
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button key={item.name} onClick={() => navigate(item.path)}
                            className="w-full bg-white rounded-xl border border-slate-50 shadow-sm p-4 flex items-center justify-between hover:border-primary/20 hover:shadow-md transition-all group active:scale-[0.99]">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 ${item.color} rounded-lg flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                                    <Icon size={16} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-secondary text-xs uppercase tracking-tight">{item.name}</p>
                                    <p className="text-slate-400 text-[9px] mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                        </button>
                    );
                })}

                {/* Logout */}
                <button onClick={() => { logout(); navigate('/login'); }}
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:bg-red-50 hover:border-red-100 transition-all group active:scale-[0.99]">
                    <div className="flex items-center gap-3 text-slate-400 group-hover:text-red-500 transition-colors">
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-slate-100 group-hover:border-red-100">
                            <LogOut size={16} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-xs uppercase tracking-tight">Sign Out</p>
                            <p className="text-slate-400 text-[9px] mt-0.5 group-hover:text-red-400">See you again soon.</p>
                        </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-200 group-hover:text-red-200" />
                </button>
            </div>
        </div>
    );
};

export default Profile;

