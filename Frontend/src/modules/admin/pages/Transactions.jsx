import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Download } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data } = await api.get('/transactions');
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filtered = transactions.filter(t => {
        const userName = t.user?.name || '';
        const txnId = t._id || '';
        const matchesSearch = userName.toLowerCase().includes(search.toLowerCase()) || txnId.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'All Types' || t.type === typeFilter.toLowerCase();
        return matchesSearch && matchesType;
    });

    const handleExportCSV = () => {
        const headers = ['TXN ID', 'User', 'Type', 'Amount', 'Description', 'Date'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                t._id,
                `"${t.user?.name || 'Unknown'}"`,
                t.type,
                t.type === 'credit' ? t.amount : `-${t.amount}`,
                `"${t.description || ''}"`,
                new Date(t.createdAt).toLocaleString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_ledger_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-left-4 duration-500 text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Financial <span className="text-primary italic">Ledger</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight mt-1">Monitor all incoming and outgoing wallet activity.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="w-full sm:w-auto bg-white border border-slate-200 text-secondary px-6 lg:px-8 py-3.5 rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                    <Download size={14} className="text-primary shrink-0" /> Export CSV
                </button>
            </header>

            <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30 font-sans">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Find txn or party..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 lg:py-3.5 bg-white border border-slate-100 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex flex-1 md:flex-none items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
                            <Filter size={12} className="text-slate-400 shrink-0" />
                            <select
                                className="bg-transparent text-[9px] lg:text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer w-full"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option>All Types</option>
                                <option>Credit</option>
                                <option>Debit</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar table-responsive-container">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 text-[9px] lg:text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                <th className="px-6 lg:px-8 py-4 lg:py-5 sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Hash</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5 font-black">Party</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5 text-center">Type</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5 text-right">Amount</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5">Reference</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-right whitespace-nowrap">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No transaction records detected.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50 last:border-0">
                                        <td className="px-6 lg:px-8 py-4 lg:py-6 font-bold text-[9px] lg:text-[10px] text-slate-400 group-hover:text-secondary uppercase sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                                            {t._id?.slice(-6)}
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 font-black text-secondary text-[10px] lg:text-xs">
                                            {t.description?.includes('Portal') ? 'Hotel Ananya Admin' : (t.user?.name || 'Unknown Party')}
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 text-center">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[7px] lg:text-[8px] font-black uppercase tracking-widest border transition-all ${t.type === 'credit' ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100' : 'bg-rose-50/50 text-rose-600 border-rose-100'
                                                }`}>
                                                {t.type === 'credit' ? <ArrowDownLeft size={8} lg:size={10} /> : <ArrowUpRight size={8} lg:size={10} />}
                                                {t.type}
                                            </div>
                                        </td>
                                        <td className={`px-4 lg:px-6 py-4 lg:py-6 text-right font-black text-xs lg:text-xl tabular-nums ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'credit' ? '+' : '-'} ₹{t.amount?.toLocaleString()}
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 text-slate-400 font-bold italic text-[9px] lg:text-[10px] truncate max-w-[200px]">
                                            {t.description || 'N/A'}
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-6 text-[8px] lg:text-[9px] text-slate-400 font-black uppercase tracking-tighter text-right tabular-nums">
                                            {new Date(t.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
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

export default Transactions;

