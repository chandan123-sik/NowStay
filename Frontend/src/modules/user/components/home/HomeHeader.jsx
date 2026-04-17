import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const HomeHeader = () => {
    const navigate = useNavigate();
    const { user, unreadCount } = useAuth();

    return (
        <div className="md:hidden sticky top-0 bg-white/95 backdrop-blur-xl z-50 border-b border-slate-100 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <img
                        src="/logo.png"
                        alt="NowStay"
                        className="h-10 w-auto object-contain cursor-pointer"
                        onClick={() => navigate('/')}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => navigate('/profile/details')}
                        className="p-2 text-secondary active:scale-95 transition-all"
                    >
                        <Settings size={18} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="p-2 text-secondary active:scale-95 transition-all relative"
                    >
                        <Bell size={18} strokeWidth={1.5} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                        )}
                    </button>
                    {user ? (
                        <div
                            onClick={() => navigate('/profile')}
                            className="w-8 h-8 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary cursor-pointer active:scale-95 transition-all"
                        >
                            {user.name[0]}
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="p-2 text-primary active:scale-95 transition-all"><User size={18} strokeWidth={1.5} /></button>
                    )}
                </div>
            </div>
            {/* App Search Bar */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const query = e.target.search.value;
                    if (query.trim()) {
                        navigate('/rooms', { state: { initialSearch: query } });
                    }
                }}
                className="relative group"
            >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={14} />
                <input
                    name="search"
                    type="text"
                    placeholder="Search experiences, dining, suites..."
                    className="w-full bg-slate-100/80 border-transparent border focus:border-primary/20 focus:bg-white text-xs pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-400 font-medium"
                />
            </form>
        </div>
    );
};

export default HomeHeader;
