import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Search, Filter, Download, Phone, CheckCircle, XCircle } from 'lucide-react';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/bookings/${id}/status`, { status: newStatus });
            fetchBookings();
        } catch (error) { alert('Failed to update status'); }
    };

    const filtered = bookings.filter(bk => {
        const searchTerm = search.replace(/\s/g, '').toLowerCase();
        const guestName = (bk.user?.name || '').replace(/\s/g, '').toLowerCase();
        const bookingId = (bk.bookingId || '').replace(/\s/g, '').toLowerCase();

        const matchesSearch = guestName.includes(searchTerm) || bookingId.includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || bk.bookingStatus.toLowerCase() === statusFilter.toLowerCase() || (statusFilter === 'All Status' && true);
        return matchesSearch && matchesStatus;
    });

    const downloadCSV = () => {
        const headers = ["Status", "Guest Name", "Contact", "Booking Date", "Check-In", "Check-Out", "Room Category", "Payment Status", "Valuation"];
        const rows = filtered.map(bk => [
            bk.bookingStatus.toUpperCase(),
            bk.user?.name || 'N/A',
            `'${bk.user?.mobile || 'N/A'}`,
            new Date(bk.createdAt).toLocaleDateString(),
            bk.checkIn,
            bk.checkOut,
            `${bk.roomType?.name} - ${bk.variant?.name}`,
            bk.paymentStatus.toUpperCase(),
            bk.totalPrice
        ]);

        const csvContent = "\uFEFF" + headers.join(",") + "\n"
            + rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Ananya_Reservation_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link); link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 text-left pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <label className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-1 block">Operations Dashboard</label>
                    <h1 className="text-xl lg:text-2xl font-bold text-secondary uppercase tracking-tight leading-none">Reservation <span className="text-primary italic">Ledger</span></h1>
                </div>
                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-sm font-bold uppercase tracking-widest text-[9px] shadow-sm hover:bg-primary hover:text-secondary transition-all"
                >
                    <Download size={14} /> Export CSV
                </button>
            </header>

            <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                            type="text"
                            placeholder="SEARCH BY GUEST OR ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary/40 transition-all uppercase"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-sm border border-slate-200">
                            <Filter size={12} className="text-slate-400 shrink-0" />
                            <select
                                className="bg-transparent text-[9px] font-bold uppercase tracking-widest outline-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option>All Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar table-responsive-container">
                    <table className="w-full min-w-[1100px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[9px] uppercase font-black tracking-[0.15em] text-slate-500 border-b border-slate-200">
                                <th className="px-6 py-5 text-left sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Identity</th>
                                <th className="px-6 py-5 text-left">Contact</th>
                                <th className="px-6 py-5 text-center">Ref/Date</th>
                                <th className="px-6 py-5 text-left">Category</th>
                                <th className="px-6 py-5 text-center">Duration</th>
                                <th className="px-6 py-5 text-center">Payment</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">No records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((bk) => (
                                    <tr key={bk._id} className="hover:bg-slate-50/50 transition-all text-xs border-b border-slate-50 last:border-0 group">
                                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-black overflow-hidden shrink-0">
                                                    {bk.user?.profilePicture ? (
                                                        <img src={bk.user.profilePicture} alt={bk.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        bk.user?.name?.[0] || '?'
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-secondary uppercase tracking-tight leading-none mb-1 truncate">{bk.user?.name}</p>
                                                    <p className="text-[8px] text-slate-400 uppercase tracking-widest leading-none truncate">{bk.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-secondary font-bold">
                                                <Phone size={10} className="text-primary shrink-0" />
                                                <span>{bk.user?.mobile || 'NA'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-[10px] font-bold text-secondary">{new Date(bk.createdAt).toLocaleDateString('en-GB')}</p>
                                            <p className="text-[7px] text-slate-400 uppercase tracking-widest leading-none mt-1">Ref: {bk.bookingId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-secondary uppercase tracking-tight leading-none">{bk.roomType?.name}</p>
                                            <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1 italic">{bk.variant?.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="text-center">
                                                    <span className="text-[8px] font-bold text-slate-400 block uppercase">In</span>
                                                    <span className="font-bold text-secondary whitespace-nowrap">{new Date(bk.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                </div>
                                                <div className="h-4 w-[1px] bg-slate-200 rotate-[30deg]" />
                                                <div className="text-center">
                                                    <span className="text-[8px] font-bold text-slate-400 block uppercase">Out</span>
                                                    <span className="font-bold text-secondary whitespace-nowrap">{new Date(bk.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${bk.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                bk.paymentStatus === 'partial' ? 'text-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                {bk.paymentStatus}
                                            </span>
                                            <p className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-tighter tabular-nums">₹{bk.totalPrice?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <div className="relative group/sel">
                                                    <select
                                                        value={bk.bookingStatus}
                                                        onChange={(e) => updateStatus(bk._id, e.target.value)}
                                                        disabled={bk.bookingStatus === 'cancelled'}
                                                        className={`appearance-none bg-white border border-slate-200 rounded-sm pl-2 pr-6 py-1.5 text-[8px] font-black uppercase tracking-widest cursor-pointer outline-none transition-all hover:border-primary/40 text-secondary
                                                            ${bk.bookingStatus === 'confirmed' ? 'text-emerald-600' :
                                                                bk.bookingStatus === 'pending' ? 'text-amber-600' :
                                                                    bk.bookingStatus === 'cancelled' ? 'text-rose-600 opacity-50 cursor-not-allowed' :
                                                                        'text-blue-600'
                                                            }`}
                                                    >
                                                        <option value="pending" disabled={bk.bookingStatus !== 'pending'}>Pending</option>
                                                        <option value="confirmed" disabled={bk.bookingStatus === 'completed' || bk.bookingStatus === 'cancelled'}>Confirmed</option>
                                                        <option value="cancelled" disabled={bk.bookingStatus === 'completed'}>Cancelled</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                    {bk.bookingStatus !== 'cancelled' && (
                                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Bookings;
