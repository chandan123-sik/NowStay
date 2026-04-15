import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Coffee, Wifi, Car, Utensils, Zap, X, Star, Clock } from 'lucide-react';
import api from '../../../../services/api';

const iconMap = { Car, Utensils, Wifi, Zap, Coffee, Star };

const Charges = () => {
    const [charges, setCharges] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCharge, setEditingCharge] = useState(null);
    const [formData, setFormData] = useState({ name: '', amount: '', category: 'Services', icon: 'Star' });

    const fetchCharges = async () => {
        try {
            const { data } = await api.get('/setup/charges');
            setCharges(data);
        } catch (error) {
            console.error('Error fetching charges:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCharges();
    }, []);

    const handleOpenModal = (charge = null) => {
        if (charge) {
            setEditingCharge(charge);
            setFormData(charge);
        } else {
            setEditingCharge(null);
            setFormData({ name: '', amount: '', category: 'Services', icon: 'Star' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingCharge) {
                await api.put(`/setup/charges/${editingCharge._id}`, formData);
            } else {
                await api.post('/setup/charges', formData);
            }
            fetchCharges();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving charge:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this service charge template?')) {
            try {
                await api.delete(`/setup/charges/${id}`);
                fetchCharges();
            } catch (error) {
                console.error('Error deleting charge:', error);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Service <span className="text-primary italic">Charges</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight mt-1">Define pricing for add-on services and amenities.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-secondary text-white px-6 lg:px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-secondary/20 active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Create Service
                </button>
            </header>

            <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="table-responsive-container">
                    <table className="w-full text-left min-w-[800px] lg:min-w-0">
                        <thead>
                            <tr className="bg-slate-50/50 text-[8px] lg:text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                <th className="px-6 lg:px-8 py-4 lg:py-5">Service Details</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5">Managed Category</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-5 text-right">Standard Rate</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {charges.map((charge) => {
                                const Icon = iconMap[charge.icon] || Star;
                                return (
                                    <tr key={charge._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-6 lg:px-8 py-4 lg:py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3 lg:gap-4">
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 text-secondary rounded-xl lg:rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all shadow-sm shrink-0">
                                                    <Icon size={16} lg:size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-secondary lowercase capitalize tracking-tight text-sm lg:text-base leading-none mb-1 truncate">{charge.name}</p>
                                                    <p className="text-[7px] lg:text-[8px] text-slate-300 font-black uppercase tracking-widest truncate block opacity-50">ID: {charge._id?.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 whitespace-nowrap">
                                            <span className="text-[10px] lg:text-xs font-bold text-slate-400 italic lowercase">{charge.category}</span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 text-right whitespace-nowrap">
                                            <span className={`font-black text-sm lg:text-xl tabular-nums ${charge.amount === 0 ? 'text-emerald-500 italic lowercase text-[10px] lg:text-xs' : 'text-secondary'}`}>
                                                {charge.amount === 0 ? 'Complimentary' : `₹${charge.amount?.toLocaleString()}`}
                                            </span>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(charge)}
                                                    className="p-2 lg:p-2.5 bg-white border border-slate-100 hover:border-primary hover:bg-slate-50 rounded-lg lg:rounded-xl text-slate-400 hover:text-secondary transition-all shadow-sm active:scale-90"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(charge._id)}
                                                    className="p-2 lg:p-2.5 bg-white border border-slate-100 hover:border-rose-100 hover:bg-rose-50 rounded-lg lg:rounded-xl text-slate-400 hover:text-rose-500 transition-all shadow-sm active:scale-90"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-[2rem] lg:rounded-[3.5rem] w-full max-w-xl p-8 lg:p-12 relative z-10 animate-in zoom-in duration-300 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-10 lg:right-10 p-2 text-slate-400 hover:text-secondary hover:bg-slate-50 rounded-xl transition-all active:scale-90"><X size={20} /></button>
                        <h2 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight mb-2 pr-10">
                            {editingCharge ? (
                                <>Modify <span className="text-primary italic">Service</span></>
                            ) : (
                                <>Initialize <span className="text-primary italic">Service</span></>
                            )}
                        </h2>
                        <p className="text-[10px] lg:text-sm text-slate-500 mb-8 lg:mb-10 font-bold italic lowercase opacity-70">Define the value Proposition and operational category.</p>

                        <form onSubmit={handleSave} className="space-y-6 lg:space-y-8 text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Service Label</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner text-sm lg:text-base"
                                        placeholder="e.g. Airport Transfer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Magnitude (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner text-sm lg:text-base"
                                        placeholder="0 for complimentary"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Classification</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-black uppercase tracking-[0.1em] text-[10px] outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                                    >
                                        <option>Accommodation</option>
                                        <option>Food & Beverage</option>
                                        <option>Transport</option>
                                        <option>Services</option>
                                        <option>Health & Wellness</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Visual Icon</label>
                                    <select
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-black uppercase tracking-[0.1em] text-[10px] outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                                    >
                                        {Object.keys(iconMap).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button className="w-full bg-secondary text-white py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] lg:text-xs hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 group">
                                <Zap size={14} className="group-hover:rotate-12 transition-transform text-primary" />
                                {editingCharge ? 'Sync Service Data' : 'Establish Registry Item'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Charges;
