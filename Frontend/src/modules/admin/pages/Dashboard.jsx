import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, animate } from 'framer-motion';
import api from '../../../services/api';
import {
    Users, BedDouble, CalendarCheck, IndianRupee,
    TrendingUp, TrendingDown, Clock, ChevronRight,
    LayoutDashboard, Activity, Search, Bell, Filter
} from 'lucide-react';

// Dynamic Counter Component
const Counter = ({ value, prefix = "", suffix = "", decimals = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(latest)
        });
        return controls.stop;
    }, [value]);

    return (
        <span>
            {prefix}{displayValue.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}{suffix}
        </span>
    );
};

// Premium Area Chart Component (Custom SVG)
const AreaChart = ({ data, color = "#C5A358" }) => {
    const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - val}`).join(' ');
    const areaPoints = `0,100 ${points} 100,100`;

    return (
        <div className="relative w-full h-full group/chart">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.polygon
                    points={areaPoints}
                    fill="url(#chartGradient)"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                    style={{ originY: 1 }}
                />
                <motion.polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                />
                {data.map((val, i) => (
                    <motion.circle
                        key={i}
                        cx={(i / (data.length - 1)) * 100}
                        cy={100 - val}
                        r="1.5"
                        fill="#fff"
                        stroke={color}
                        strokeWidth="1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2 + (i * 0.1), type: "spring" }}
                        className="pointer-events-none"
                    />
                ))}
            </svg>
        </div>
    );
};

const StatCard = ({ label, value, sub, icon: Icon, trend, color, accentColor, sparklineData, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.6 }}
            whileHover={{ y: -4 }}
            className="group bg-white p-4 lg:p-5 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-500 relative overflow-hidden"
        >
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-700 ${accentColor}`} />

            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 border border-current border-opacity-5`}>
                    <Icon size={18} className={color} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full border ${trend > 0
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}
                    >
                        {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h4 className="text-2xl lg:text-3xl font-serif text-secondary tracking-tight leading-none">
                    {typeof value === 'number' ? (
                        <Counter value={value} prefix={label.includes('Revenue') ? '₹' : ''} suffix={label.includes('Rate') ? '%' : ''} />
                    ) : (
                        <span>{value}</span>
                    )}
                </h4>
                <div className="pt-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                    <p className="text-[8px] text-slate-300 font-medium italic truncate">{sub}</p>
                </div>
            </div>

            <div className="mt-5 h-6 w-full flex items-end gap-1">
                {sparklineData?.map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.3 + (i * 0.05), duration: 0.8 }}
                        className={`flex-1 rounded-t-sm opacity-20 group-hover:opacity-100 transition-all duration-500 ${accentColor}`}
                    />
                ))}
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentBookings, setRecentBookings] = useState([]);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        const fetchDashboardData = async () => {
            try {
                const [statsRes, bookingsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/bookings')
                ]);
                setStats(statsRes.data || null);
                const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
                setRecentBookings([...bookings].reverse().slice(0, 5));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = useMemo(() => [
        {
            label: 'Total Bookings',
            value: stats?.totalBookings || 0,
            sub: 'Historical Volume',
            icon: CalendarCheck,
            color: 'text-primary',
            accentColor: 'bg-primary'
        },
        {
            label: 'Occupancy Rate',
            value: stats?.occupancyRate || 0,
            sub: `${stats?.occupiedCount || 0} active nodes`,
            icon: Activity,
            color: 'text-accent',
            accentColor: 'bg-accent'
        },
        {
            label: 'Today Arrivals',
            value: stats?.checkIns || 0,
            sub: 'Guests arriving',
            icon: Clock,
            color: 'text-emerald-600',
            accentColor: 'bg-emerald-600'
        },
        {
            label: 'Total Revenue',
            value: stats?.totalRevenue || 0,
            sub: 'Gross Sales',
            icon: IndianRupee,
            color: 'text-primary-dark',
            accentColor: 'bg-primary-dark'
        },
    ], [stats]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center p-20 bg-cream">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-10 h-10 border-4 border-primary border-t-accent rounded-full"
            />
        </div>
    );

    return (
        <div className="space-y-6 py-2 max-w-[1500px] mx-auto overflow-hidden">
            {/* Header with Greeting (Simplified) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <h2 className="text-2xl lg:text-3xl font-serif text-secondary lowercase">
                        {greeting}, <span className="text-primary italic">Manager.</span>
                    </h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        System operational — sync 2m ago
                    </p>
                </div>
            </div>

            {/* Grid of Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                {statCards.map((stat, idx) => (
                    <StatCard
                        key={idx}
                        index={idx}
                        {...stat}
                        sparklineData={[40, 65, 45, 80, 55, 90, 70]}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Guest Manifest */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-5 lg:p-7 shadow-sm h-full flex flex-col">
                        <div className="flex items-start sm:items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-serif text-secondary lowercase">Recent <span className="text-primary italic">manifest</span></h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Live tracking active</p>
                            </div>
                            <Link to="/admin/bookings" className="text-[9px] font-black text-primary hover:text-secondary uppercase tracking-widest flex items-center gap-1 group">
                                Registry <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-3 flex-grow">
                            {recentBookings.length > 0 ? recentBookings.map((bk, idx) => (
                                <motion.div
                                    key={bk.id || bk._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group p-3 rounded-2xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-500 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                                >
                                    <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-secondary text-accent flex items-center justify-center text-xs font-serif font-black shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                            {bk.user?.name?.[0] || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[12px] font-black text-secondary truncate leading-tight">{bk.user?.name}</h4>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight truncate">{bk.plan?.planName || 'Standard'}</p>
                                        </div>
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <div className="text-[9px] font-black text-secondary tabular-nums flex items-center gap-2">
                                            <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-100">{new Date(bk.checkIn).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                            <span className="text-slate-300">→</span>
                                            <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-100">{new Date(bk.checkOut).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    </div>

                                    <div className="col-span-3 sm:col-span-2 sm:text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${bk.bookingStatus === 'confirmed'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white'
                                                : 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white'
                                            }`}>
                                            {bk.bookingStatus}
                                        </span>
                                    </div>

                                    <div className="col-span-3 sm:col-span-2 text-right">
                                        <p className="text-[14px] font-serif italic text-secondary tracking-tight tabular-nums">₹{bk.totalPrice?.toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="py-12 text-center">
                                    <CalendarCheck size={24} className="mx-auto mb-2 text-slate-200" />
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">No manifests detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Analytics Column */}
                <div className="space-y-4">
                    <div className="bg-secondary rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl group flex flex-col justify-between h-[280px]">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-24 -mt-24 blur-[60px]" />

                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-xl font-serif italic mb-1">Financial Pulse</h3>
                            <p className="text-white/40 text-[8px] font-black tracking-widest mb-4 uppercase">Weekly Yield Performance</p>

                            {/* DYNAMIC LINE GRAPH */}
                            <div className="flex-grow pt-4">
                                <AreaChart data={[30, 60, 45, 80, 50, 85, 95]} />
                            </div>

                            <div className="flex justify-between items-center px-1 mb-6">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                    <span key={i} className="text-[7px] font-black text-white/20 uppercase">{day}</span>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="text-white/30 text-[7px] font-black uppercase mb-0.5">Projected EBITDA</p>
                                    <p className="text-xl font-serif text-accent tracking-tighter tabular-nums"><Counter value={1245000} prefix="₹" /></p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-emerald-400 text-[10px] font-black italic">
                                        <TrendingUp size={12} /> +24%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 p-4 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent/10 text-accent rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                                <Users size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Users</p>
                                <p className="text-lg font-serif text-secondary tabular-nums leading-none"><Counter value={stats?.totalUsers || 0} /></p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-200 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
