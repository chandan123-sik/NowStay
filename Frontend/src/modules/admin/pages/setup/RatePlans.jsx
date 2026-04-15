import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, Layout, Award, Zap, X } from 'lucide-react';
import api from '../../../../services/api';

const RatePlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', description: '', inclusions: '' });

    const fetchPlans = async () => {
        try {
            const { data } = await api.get('/setup/rate-plans');
            setPlans(data);
        } catch (error) {
            console.error('Error fetching rate plans:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData(plan);
        } else {
            setEditingPlan(null);
            setFormData({ name: '', code: '', description: '', inclusions: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await api.put(`/setup/rate-plans/${editingPlan._id}`, formData);
            } else {
                await api.post('/setup/rate-plans', formData);
            }
            fetchPlans();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving rate plan');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this global rate plan? This won\'t affect existing pricing but will remove it from future selections.')) {
            try {
                await api.delete(`/setup/rate-plans/${id}`);
                fetchPlans();
            } catch (error) {
                console.error('Error deleting rate plan:', error);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500 text-left pb-10 lg:pb-0">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Global Rate <span className="text-primary italic">Plans</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight mt-1">Define your property's pricing strategies (EP, CP, MAP, AP).</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-secondary text-white px-6 lg:px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-secondary/20 active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> New Strategy
                </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 text-left">
                {plans.length === 0 ? (
                    <div className="lg:col-span-2 py-20 text-center bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-dashed border-slate-200">
                        <Zap size={40} className="mx-auto text-slate-200 mb-4 animate-pulse" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] lg:text-xs">No rate plans initialized.</p>
                    </div>
                ) : (
                    plans.map(plan => (
                        <div key={plan._id} className="bg-white p-6 lg:p-10 rounded-[1.5rem] lg:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden group hover:-translate-y-1">
                            <div className="absolute bottom-0 right-0 w-32 h-32 lg:w-48 lg:h-48 bg-primary/5 rounded-full -mb-16 -mr-16 transition-transform group-hover:scale-125 duration-700" />

                            <div className="flex justify-between items-start relative z-10 transition-transform">
                                <div className="min-w-0">
                                    <h3 className="text-lg lg:text-2xl font-black text-secondary tracking-tight leading-tight lowercase capitalize truncate pr-2">{plan.name}</h3>
                                    <span className="inline-block mt-2 px-3 py-1 bg-secondary text-primary rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em]">{plan.code}</span>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => handleOpenModal(plan)} className="h-9 w-9 lg:h-12 lg:w-12 flex items-center justify-center bg-slate-50 hover:bg-primary/20 rounded-xl text-slate-400 hover:text-primary transition-all active:scale-90">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(plan._id)} className="h-9 w-9 lg:h-12 lg:w-12 flex items-center justify-center bg-slate-50 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all active:scale-90">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 lg:mt-10 space-y-4 lg:space-y-6 relative z-10">
                                <div className="flex items-start gap-4 p-4 lg:p-6 bg-slate-50/50 rounded-2xl lg:rounded-3xl border border-slate-100 hover:bg-white transition-colors group/inner">
                                    <div className="p-2.5 bg-white text-primary rounded-xl shadow-sm border border-slate-100 group-hover/inner:rotate-12 transition-transform shrink-0">
                                        <Award size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] lg:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Strategic Inclusions</p>
                                        <p className="text-xs lg:text-sm font-bold text-secondary italic leading-relaxed lowercase first-letter:capitalize">{plan.inclusions || 'No specific inclusions noted.'}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] lg:text-xs text-slate-400 font-bold leading-relaxed lg:leading-loose line-clamp-2 min-h-[3em] opacity-70">
                                    {plan.description || 'Global rate strategy for property-wide inventory allocation and yield management.'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-[2rem] lg:rounded-[3.5rem] w-full max-w-2xl p-8 lg:p-14 relative z-10 animate-in zoom-in duration-300 shadow-2xl overflow-y-auto max-h-[95vh] custom-scrollbar text-left">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-10 lg:right-10 p-2 text-slate-400 hover:text-secondary hover:bg-slate-50 rounded-xl transition-all active:scale-90"><X size={20} /></button>
                        <h2 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight mb-2 pr-10">{editingPlan ? 'Refine Strategy' : 'Initialize Strategy'}</h2>
                        <p className="text-[10px] lg:text-sm text-slate-500 mb-8 lg:mb-12 font-bold italic lowercase opacity-70">Define the global nomenclature and service inclusions.</p>

                        <form onSubmit={handleSave} className="space-y-6 lg:space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Strategy Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Continental Plan"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner text-sm lg:text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Protocol Code</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="CP"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-black uppercase tracking-[0.2em] text-sm lg:text-base outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Inclusions Overview</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Bed and Breakfast Included"
                                    value={formData.inclusions}
                                    onChange={e => setFormData({ ...formData, inclusions: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3.5 lg:py-4.5 font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-inner text-sm lg:text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Strategic Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-4.5 lg:py-6 font-bold outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] lg:min-h-[160px] resize-none text-sm lg:text-base shadow-inner"
                                    placeholder="Describe the operational scope of this rate plan..."
                                />
                            </div>

                            <button className="w-full bg-secondary text-white py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] lg:text-xs hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-secondary/10 flex items-center justify-center gap-2 group">
                                <Zap size={14} className="group-hover:rotate-12 transition-transform text-primary" />
                                {editingPlan ? 'Sync Strategic Data' : 'Establish Strategy'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RatePlans;
