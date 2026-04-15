import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { Plus, Trash2, Edit2, ShieldCheck, X } from 'lucide-react';

const Taxes = () => {
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTax, setEditingTax] = useState(null);
    const [formData, setFormData] = useState({ name: '', rate: '', type: 'Percentage', status: 'Active' });

    const fetchTaxes = async () => {
        try {
            const { data } = await api.get('/setup/taxes');
            setTaxes(data);
        } catch (error) {
            console.error('Error fetching taxes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxes();
    }, []);

    const handleOpenModal = (tax = null) => {
        if (tax) {
            setEditingTax(tax);
            setFormData(tax);
        } else {
            setEditingTax(null);
            setFormData({ name: '', rate: '', type: 'Percentage', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingTax) {
                await api.put(`/setup/taxes/${editingTax._id}`, formData);
            } else {
                await api.post('/setup/taxes', formData);
            }
            fetchTaxes();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving tax:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tax configuration?')) {
            try {
                await api.delete(`/setup/taxes/${id}`);
                fetchTaxes();
            } catch (error) {
                console.error('Error deleting tax:', error);
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
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Tax <span className="text-primary italic">Registry</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight mt-1">Manage governmental and property-level tax structures.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-secondary text-white px-6 lg:px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-secondary/20 active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add New Tax
                </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                {taxes.map(tax => (
                    <div key={tax._id} className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />

                        <div className="flex justify-between items-start mb-6 lg:mb-8 relative z-10">
                            <div className="p-3 bg-secondary text-primary rounded-xl lg:rounded-2xl shadow-lg shadow-secondary/10 shrink-0">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(tax)}
                                    className="p-2 bg-slate-50 hover:bg-primary/10 rounded-xl text-slate-400 hover:text-primary transition-all active:scale-90"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(tax._id)}
                                    className="p-2 bg-slate-50 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-lg lg:text-xl font-black text-secondary lowercase capitalize truncate">{tax.name}</h3>
                            <p className="text-[7px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 truncate block opacity-40">ID: {tax._id?.slice(-8)}</p>

                            <div className="mt-6 lg:mt-8 flex items-end justify-between">
                                <div className="space-y-1 flex-1">
                                    <p className="text-[8px] lg:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Applied Rate</p>
                                    <div className="flex items-center">
                                        <span className="text-2xl lg:text-3xl font-black text-secondary tabular-nums leading-none">
                                            {tax.type === 'Percentage' ? `${tax.rate}%` : `₹${tax.rate}`}
                                        </span>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 text-[8px] lg:text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm transition-all whitespace-nowrap ${tax.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                    }`}>
                                    {tax.status}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-[2rem] lg:rounded-[3.5rem] w-full max-w-lg p-8 lg:p-12 relative z-10 animate-in zoom-in duration-300 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-10 lg:right-10 p-2 text-slate-400 hover:text-secondary hover:bg-slate-50 rounded-xl transition-all active:scale-90"><X size={20} /></button>
                        <h2 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight mb-2 pr-10">
                            {editingTax ? (
                                <>Refine Tax <span className="text-primary italic">Policy</span></>
                            ) : (
                                <>Establish <span className="text-primary italic">New Tax</span></>
                            )}
                        </h2>
                        <p className="text-[10px] lg:text-sm text-slate-500 mb-8 lg:mb-10 font-bold italic lowercase opacity-70">Specify the magnitude and classification for regulatory alignment.</p>

                        <form onSubmit={handleSave} className="space-y-6 lg:space-y-8 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tax Nomenclature</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Service VAT"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner text-sm lg:text-base"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Applied Rate</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.rate}
                                        onChange={e => setFormData({ ...formData, rate: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner text-sm lg:text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Valuation Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-black uppercase tracking-[0.1em] text-[10px] outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                                    >
                                        <option value="Percentage">Percentage (%)</option>
                                        <option value="Fixed">Fixed (₹)</option>
                                    </select>
                                </div>
                            </div>
                            <button className="w-full bg-secondary text-white py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] lg:text-xs hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 group">
                                <ShieldCheck size={14} className="group-hover:rotate-12 transition-transform" />
                                {editingTax ? 'Update Registry' : 'Commit to Database'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Taxes;
