import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Bed, Ticket, Users, Wallet, LogOut,
    Settings, ShieldCheck, Tag, Zap, Percent, Building2, HardDrive, Image, Layers, Menu, X as CloseIcon, MessageSquare, Scale, Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on route change (for mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    const sections = [
        {
            title: 'Operations',
            links: [
                { name: 'Insights', path: '/admin', icon: LayoutDashboard },
                { name: 'Bookings', path: '/admin/bookings', icon: Ticket },
                { name: 'Guest Ledger', path: '/admin/users', icon: Users },
                { name: 'Financials', path: '/admin/wallet', icon: Wallet },
            ]
        },
        {
            title: 'Inventory',
            links: [
                { name: 'Room Types', path: '/admin/rooms', icon: Bed },
                { name: 'Room Variants', path: '/admin/rooms/variants', icon: Layers },
                { name: 'Availability', path: '/admin/inventory/availability', icon: HardDrive },
                { name: 'Bulk Update', path: '/admin/inventory/bulk-update', icon: Copy },
                { name: 'Yield Rates', path: '/admin/inventory/rates', icon: Zap },
                { name: 'Yield Management', path: '/admin/setup/pricing', icon: Tag },
            ]
        },
        {
            title: 'Configuration',
            links: [
                { name: 'Promotions', path: '/admin/discounts', icon: Tag },
                { name: 'Tax Registry', path: '/admin/setup/taxes', icon: Percent },
                { name: 'Service Charges', path: '/admin/setup/charges', icon: ShieldCheck },
                { name: 'Rate Plans', path: '/admin/setup/rate-plans', icon: Zap },
                { name: 'Guest Feedback', path: '/admin/messages', icon: MessageSquare },
                { name: 'Legal Protocols', path: '/admin/setup/terms', icon: Scale },
                { name: 'Media Assets', path: '/admin/media', icon: Image },
                { name: 'Payment Setups', path: '/admin/setup/payments', icon: Wallet },
                { name: 'Property Info', path: '/admin/setup/property', icon: Building2 },
                { name: 'Other Services', path: '/admin/services', icon: Building2 },
            ]
        }
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar Overlay (Mobile only) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-secondary text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-8 border-b border-white/5 flex flex-col items-center shrink-0 relative">
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <CloseIcon size={20} />
                    </button>
                    <img src="/logo.png" alt="Ananya Hotel" className="h-10 w-auto brightness-0 invert mb-3" />
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] uppercase font-black tracking-[0.4em] text-primary">Intelligence Portal</span>
                    </div>
                </div>

                <nav className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8 mt-2">
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-3">
                            <h3 className="px-4 text-[10px] uppercase font-black tracking-[0.2em] text-white/30">{section.title}</h3>
                            <div className="space-y-1">
                                {section.links.map((link) => {
                                    const Icon = link.icon;
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                                ? 'bg-primary text-secondary shadow-lg shadow-primary/20 scale-[1.02]'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Icon size={18} className={`${isActive ? 'text-secondary' : 'text-primary/60 group-hover:text-primary'} transition-colors`} />
                                            <span className="text-sm font-bold tracking-tight">{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 bg-secondary/50 backdrop-blur-xl">
                    <button
                        onClick={logout}
                        className="flex items-center justify-center space-x-3 w-full px-4 py-3.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all duration-500 group shadow-inner"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest leading-none">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow flex flex-col overflow-hidden min-w-0 relative">
                <header className="bg-white/90 backdrop-blur-xl h-16 lg:h-20 border-b border-slate-100 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-3 lg:gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-secondary lg:hidden hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center shrink-0"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex flex-col min-w-0">
                            <p className="text-[7px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Node</p>
                            <h1 className="text-xs lg:text-xl font-black text-secondary lowercase capitalize tracking-tighter truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
                                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Insights Overview'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-6">


                        <div className="hidden md:flex items-center gap-3 pr-4 lg:pr-6 border-r border-slate-100">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-secondary leading-none">Security Protocol</p>
                                <p className="text-[8px] text-emerald-500 font-bold mt-1 uppercase">Active</p>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ShieldCheck size={16} />
                            </div>
                        </div>

                        <div
                            onClick={() => navigate('/admin/profile')}
                            className="flex items-center space-x-2 lg:space-x-4 group cursor-pointer"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-extrabold text-secondary group-hover:text-primary transition-colors italic leading-none truncate max-w-[100px]">{user?.name || 'Super Admin'}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">L1 AUTH</p>
                            </div>
                            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-secondary text-primary rounded-lg lg:rounded-2xl flex items-center justify-center font-black text-xs lg:text-lg border-2 border-primary/20 group-hover:border-primary transition-all shadow-lg shadow-secondary/10 shrink-0 overflow-hidden">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    user?.name?.[0]?.toUpperCase() || 'SA'
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto p-4 lg:p-10 bg-slate-50/50 custom-scrollbar scroll-smooth">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
