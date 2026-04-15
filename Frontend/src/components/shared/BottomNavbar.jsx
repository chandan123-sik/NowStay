import { Link, useLocation } from 'react-router-dom';
import { Home, Bed, Wallet, User, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Rooms', path: '/rooms', icon: Bed },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'Profile', path: '/profile', icon: User },
];

const BottomNavbar = () => {
    const location = useLocation();
    const { user } = useAuth();

    // Redirect Profile link to login if not authenticated
    const items = navItems.map(item =>
        item.path === '/profile' ? { ...item, path: user ? '/profile' : '/login' } : item
    );

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-[100]">
            <div className="flex justify-around items-center h-[60px] px-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path === '/profile' && location.pathname.startsWith('/profile'));

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-all active:scale-90"
                        >
                            {/* Active Pill */}
                            {isActive && (
                                <div className="absolute top-1 w-8 h-8 bg-primary/10 rounded-xl" />
                            )}
                            <Icon
                                size={19}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                className={`relative z-10 transition-all ${isActive ? 'text-primary scale-110' : 'text-slate-400'}`}
                            />
                            <span className={`relative z-10 text-[9px] font-black uppercase tracking-tight transition-all ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
            {/* Safe area spacer for notch phones */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
    );
};

export default BottomNavbar;
