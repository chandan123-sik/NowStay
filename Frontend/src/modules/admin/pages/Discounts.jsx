import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Ticket, Plus, ToggleLeft, ToggleRight, Activity, Percent, Tag, X, Check, Trash2 } from 'lucide-react';

const Discounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState({ code: '', type: 'Percentage', value: '' });

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/discounts');
            setDiscounts(data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        try {
            await api.post('/discounts', newCoupon);
            fetchDiscounts();
            setIsModalOpen(false);
            setNewCoupon({ code: '', type: 'Percentage', value: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating coupon');
        }
    };

    const toggleStatus = async (id) => {
        try {
            await api.patch(`/discounts/${id}/toggle`);
            fetchDiscounts();
        } catch (error) {
            console.error('Error toggling coupon:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon permanently?')) return;
        try {
            await api.delete(`/discounts/${id}`);
            fetchDiscounts();
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    };

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Promotional <span className="text-primary italic">Matrix</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight mt-1">Create and manage coupon codes for guests and loyalty members.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-primary text-secondary px-6 lg:px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Generate Coupon
                </button>
            </header>

            {isModalOpen && (
                <div className="fixed inset-0 bg-secondary/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] lg:rounded-[3rem] w-full max-w-md p-6 lg:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-8 lg:right-8 p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 active:scale-90">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl lg:text-2xl font-black text-secondary mb-6 lg:mb-8 pr-10">Forge Reward <span className="text-primary italic">Token</span></h3>
                        <form onSubmit={handleAddCoupon} className="space-y-5 lg:space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Activation Code</label>
                                <input required value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 py-3 lg:py-4 text-xs font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase shadow-inner"
                                    placeholder="NOWSTAY-2026" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Logic Type</label>
                                    <select value={newCoupon.type} onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 py-3 lg:py-4 text-[10px] lg:text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner">
                                        <option>Percentage</option>
                                        <option>Fixed</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{newCoupon.type === 'Percentage' ? 'Factor (%)' : 'Magnitude (₹)'}</label>
                                    <input required type="number" min="0" value={newCoupon.value} onChange={e => setNewCoupon({ ...newCoupon, value: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 py-3 lg:py-4 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 lg:pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 lg:py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-secondary transition-colors">Abort</button>
                                <button type="submit" className="flex-2 py-3 lg:py-4 bg-secondary text-primary rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all outline-none">Initialize Coupon</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifying Ledger...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="table-responsive-container">
                        <table className="w-full text-left min-w-[1000px] lg:min-w-0">
                            <thead>
                                <tr className="bg-slate-50/50 text-[8px] lg:text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                    <th className="px-6 lg:px-8 py-4 lg:py-5">Campaign / Code</th>
                                    <th className="px-4 lg:px-6 py-4 lg:py-5 text-center">Incentive Type</th>
                                    <th className="px-4 lg:px-6 py-4 lg:py-5 text-right">Value</th>
                                    <th className="px-4 lg:px-6 py-4 lg:py-5">Redemption Velocity</th>
                                    <th className="px-4 lg:px-6 py-4 lg:py-5 text-center">Status</th>
                                    <th className="px-6 lg:px-8 py-4 lg:py-5 text-right">Switch</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm font-medium">
                                {discounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-slate-400 italic">No coupons found. Create your first campaign.</td>
                                    </tr>
                                ) : discounts.map((d) => (
                                    <tr key={d._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-6 lg:px-8 py-4 lg:py-6 whitespace-nowrap">
                                            <div className="flex items-center space-x-3 lg:space-x-4">
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary text-primary rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/5 shrink-0">
                                                    <Ticket size={16} lg:size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="block font-black text-secondary tracking-[0.1em] text-sm lg:text-base group-hover:text-primary transition-colors truncate">{d.code}</span>
                                                    <span className="text-[7px] lg:text-[8px] text-slate-300 font-black uppercase tracking-tighter truncate block">{d._id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 text-center whitespace-nowrap">
                                            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[7px] lg:text-[8px] font-black uppercase tracking-widest shadow-sm ${d.type === 'Percentage' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                {d.type === 'Percentage' ? <Percent size={8} lg:size={10} /> : <Tag size={8} lg:size={10} />}
                                                {d.type}
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 font-black text-secondary text-sm lg:text-lg text-right tabular-nums whitespace-nowrap">
                                            {d.type === 'Percentage' ? `${d.value}%` : `₹${d.value}`}
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 min-w-[120px]">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1 lg:h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                    <div className="h-full bg-primary" style={{ width: `${Math.min((d.used || 0) / 2, 100)}%` }} />
                                                </div>
                                                <span className="text-[8px] lg:text-[10px] font-black text-secondary whitespace-nowrap tabular-nums">{d.used || 0} Uses</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 text-center whitespace-nowrap">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-sm ${d.active ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'text-rose-400 bg-rose-50 border-rose-100'}`}>
                                                <div className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full ${d.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                                                <span className="text-[7px] lg:text-[8px] uppercase tracking-widest font-black">{d.active ? 'Live' : 'Paused'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2 lg:gap-3">
                                                <button
                                                    onClick={() => toggleStatus(d._id)}
                                                    className={`transition-all hover:scale-110 active:scale-90 p-1 lg:p-0 ${d.active ? 'text-primary' : 'text-slate-200'}`}
                                                >
                                                    {d.active ? <ToggleRight size={28} lg:size={32} /> : <ToggleLeft size={28} lg:size={32} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(d._id)}
                                                    className="p-1.5 lg:p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg lg:rounded-xl transition-all active:scale-90"
                                                >
                                                    <Trash2 size={14} lg:size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Analytics Card */}
            {/* Quick Analytics Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 pb-10 lg:pb-0">
                <div className="bg-secondary rounded-[1.5rem] lg:rounded-[2.5rem] p-6 lg:p-10 text-white relative overflow-hidden group shadow-2xl shadow-secondary/20">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110" />
                    <h3 className="font-serif text-xl lg:text-3xl italic mb-2 tracking-tight">Campaign <span className="text-primary italic">Dynamics</span></h3>
                    <p className="text-white/40 text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-8 lg:mb-12">Coupon yield: 18% contribution to monthly GTV.</p>
                    <div className="flex items-end gap-1.5 h-16 lg:h-24">
                        {[40, 20, 60, 30, 80, 50, 90].map((h, i) => (
                            <div key={i} title={`${h}%`} className="flex-1 bg-primary/10 hover:bg-primary transition-all rounded-t-lg lg:rounded-t-xl cursor-default shadow-inner" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>
                <div className="bg-primary rounded-[1.5rem] lg:rounded-[3rem] p-6 lg:p-10 text-secondary flex flex-col justify-between shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform duration-500">
                    <div className="flex justify-between items-start mb-6 lg:mb-0">
                        <Tag size={32} className="opacity-30 -rotate-12" />
                        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] bg-secondary/5 px-3 py-1 rounded-full border border-secondary/10">Strategic Protocol</span>
                    </div>
                    <div>
                        <h3 className="font-black text-lg lg:text-2xl mb-2 lg:mb-3 leading-tight tracking-tight lowercase capitalize">Personalize <span className="italic">Incentives</span></h3>
                        <p className="text-secondary/70 text-[10px] lg:text-xs font-bold leading-relaxed italic max-w-sm">"Dynamic discounts based on guest loyalty tier increase redemption rates by 24.8%."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Discounts;

