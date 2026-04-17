import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, unreadCount } = useAuth();
    const { balance } = useWallet();

    // Pages that have a dark hero/background where white text is needed
    const isHeroPage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Rooms', path: '/rooms' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    // Navbar should be "Dark Mode" (white bg) on internal pages or when scrolled
    // HOWEVER, when the mobile menu is open, the parent nav must be transparent 
    // to fix a browser bug where parent backdrop-blur clips full-screen children.
    const isNavbarDark = (scrolled || !isHeroPage) && !isOpen;

    return (
        <nav className={`fixed w-full z-50 transition-all duration-700 hidden md:block ${isNavbarDark ? 'bg-white/95 backdrop-blur-xl py-1 shadow-luxury border-b border-slate-100' : 'bg-transparent py-2'
            }`}>
            <div className="section-container !py-0 flex items-center justify-between">
                <Link to="/" className="group flex items-center z-[70] relative">
                    <img
                        src="/logo.png"
                        alt="NowStay"
                        className={`h-20 md:h-30 w-auto transition-all duration-500 object-contain ${!isNavbarDark && !isOpen ? 'brightness-0 invert' : ''}`}
                    />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-12">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:text-primary ${isNavbarDark ? (location.pathname === link.path ? 'text-primary' : 'text-secondary/60') : 'text-white/70'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center space-x-8">
                    {user ? (
                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className={`text-[8px] font-bold uppercase tracking-widest ${isNavbarDark ? 'text-slate-400' : 'text-white/40'}`}>Private Balance</p>
                                <p className={`text-sm font-bold ${isNavbarDark ? 'text-secondary' : 'text-white'}`}>₹{balance.toLocaleString()}</p>
                            </div>
                            <Link to="/notifications" className={`p-2.5 rounded-full border transition-all duration-500 relative ${isNavbarDark ? 'border-primary/20 text-primary hover:bg-primary hover:text-white' : 'border-white/20 text-white hover:bg-white hover:text-secondary'
                                }`}>
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
                                )}
                            </Link>
                            <Link to="/profile" className={`p-2.5 rounded-full border transition-all duration-500 ${isNavbarDark ? 'border-primary/20 text-primary hover:bg-primary hover:text-white' : 'border-white/20 text-white hover:bg-white hover:text-secondary'
                                }`}>
                                <User size={18} />
                            </Link>
                        </div>
                    ) : (
                        <Link to="/login" className={`btn-premium !px-8 !py-3 !text-[9px] ${!isNavbarDark && '!bg-white !text-secondary hover:!bg-primary hover:!text-white shadow-none'
                            }`}>
                            Entrance
                        </Link>
                    )}
                </div>

                {/* Mobile Actions */}
                <div className="flex md:hidden items-center space-x-2">
                    {user && (
                        <Link to="/notifications" className={`p-2 transition-all duration-300 relative ${isNavbarDark ? 'text-secondary' : 'text-white'}`}>
                            <Bell size={24} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                            )}
                        </Link>
                    )}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`p-2 transition-all duration-300 z-[70] relative ${isOpen ? 'text-white' : (isNavbarDark ? 'text-secondary' : 'text-white')
                            }`}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Premium Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-secondary z-[60] flex flex-col items-center justify-center p-8 transition-all duration-700 md:hidden ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
                }`}>
                <div className="flex flex-col items-center space-y-10">
                    {navLinks.map((link, i) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={`text-4xl font-serif text-white hover:text-primary transition-all duration-500 lowercase italic transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                }`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className={`pt-12 transition-all duration-700 delay-500 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                        }`}>
                        <Link to="/login" onClick={() => setIsOpen(false)} className="btn-premium !bg-white !text-secondary shadow-2xl">
                            {user ? 'My Sanctuary' : 'Entrance'}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
