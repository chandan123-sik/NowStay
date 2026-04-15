import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../../context/WalletContext';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Filter, Calendar, Search } from 'lucide-react';

const TransactionHistory = () => {
    const navigate = useNavigate();
    const { transactions, loading } = useWallet();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterType, setFilterType] = React.useState('all'); // all, credit, debit

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.razorpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterType === 'all' || t.type === filterType;

        return matchesSearch && matchesFilter;
    });

    const cycleFilter = () => {
        setFilterType(prev => {
            if (prev === 'all') return 'credit';
            if (prev === 'credit') return 'debit';
            return 'all';
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 text-left">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-5 sticky top-0 z-50 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-secondary" />
                </button>
                <div>
                    <h1 className="text-lg font-black text-secondary lowercase capitalize">
                        Transaction <span className="text-primary italic">Ledger</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Financial Activity Logs</p>
                </div>
            </div>

            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                {/* Search & Filters */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full bg-white border border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-[10px] font-bold outline-none ring-primary/20 focus:ring-4 transition-all"
                        />
                    </div>
                    <button
                        onClick={cycleFilter}
                        className={`border rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95
                        ${filterType === 'all' ? 'bg-white border-slate-100 text-slate-400' : 'bg-primary/10 border-primary/20 text-primary'}`}
                    >
                        <Filter size={14} /> {filterType === 'all' ? 'Filter' : filterType}
                    </button>
                </div>

                {/* Date Grouped Transactions */}
                <div className="space-y-4">
                    {filteredTransactions.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100">
                            <Calendar size={40} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-serif italic text-sm">
                                {searchTerm ? 'No results matching your query.' : 'Your financial journey is yet to begin.'}
                            </p>
                        </div>
                    ) : (
                        filteredTransactions.map((t) => (
                            <div key={t._id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors
                                    ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                    {t.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xs font-black text-secondary uppercase tracking-tight truncate">{t.description}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(t.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{t.razorpay_payment_id ? 'Razorpay' : 'Admin Update'}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-sm font-black tracking-tight ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Confirmed</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
