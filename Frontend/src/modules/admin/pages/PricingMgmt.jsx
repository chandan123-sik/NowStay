import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Plus, Edit2, Trash2, X, Coffee, ChevronDown } from 'lucide-react';

const EMPTY_FORM = {
    roomVariant: '', ratePlan: '', planName: '', adult1Price: '', adult2Price: '', extraAdultPrice: '', childPrice: '', mealsIncluded: '', planImage: ''
};

const PricingMgmt = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [variants, setVariants] = useState([]);
    const [plans, setPlans] = useState([]);
    const [ratePlans, setRatePlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [selectedRoomType, setSelectedRoomType] = useState('');
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        try {
            const [roomsRes, plansRes, ratesRes] = await Promise.all([
                api.get('/rooms'),
                api.get('/pricing'),
                api.get('/setup/rate-plans')
            ]);
            setRoomTypes(roomsRes.data);
            setPlans(plansRes.data);
            setRatePlans(ratesRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // When roomType changes in the form, re-fetch variants
    useEffect(() => {
        if (!selectedRoomType) { setVariants([]); return; }
        api.get(`/rooms/variants/${selectedRoomType}`)
            .then(r => setVariants(r.data))
            .catch(() => setVariants([]));
    }, [selectedRoomType]);

    const openCreate = () => {
        setEditingPlan(null);
        setFormData(EMPTY_FORM);
        setSelectedRoomType('');
        setVariants([]);
        setIsModalOpen(true);
    };

    const openEdit = (plan) => {
        setEditingPlan(plan);
        // Pre-populate room type from populated variant
        const rtId = plan.roomVariant?.roomType?._id || plan.roomVariant?.roomType || '';
        setSelectedRoomType(rtId);
        setFormData({
            roomVariant: plan.roomVariant?._id || '',
            ratePlan: plan.ratePlan?._id || plan.ratePlan || '',
            planName: plan.planName,
            adult1Price: plan.adult1Price,
            adult2Price: plan.adult2Price,
            extraAdultPrice: plan.extraAdultPrice,
            childPrice: plan.childPrice,
            mealsIncluded: plan.mealsIncluded,
            planImage: plan.planImage || ''
        });
        // fetch variants for the room type
        if (rtId) {
            api.get(`/rooms/variants/${rtId}`).then(r => setVariants(r.data)).catch(() => setVariants([]));
        }
        setIsModalOpen(true);
    };

    const handleRatePlanChange = (planId) => {
        const selected = ratePlans.find(rp => rp._id === planId);
        if (selected) {
            setFormData(prev => ({
                ...prev,
                ratePlan: planId,
                planName: selected.name,
                mealsIncluded: selected.inclusions
            }));
        } else {
            setFormData(prev => ({ ...prev, ratePlan: '' }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const form = new FormData();
        form.append('image', file);
        try {
            const { data } = await api.post('/media/upload-single', form);
            setFormData(f => ({ ...f, planImage: data.imageUrl }));
        } catch (error) {
            alert('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Sanitize payload: remove empty strings for optional ObjectId or URL fields
        const payload = { ...formData };

        // Price validation and parsing
        payload.adult1Price = parseInt(payload.adult1Price) || 0;
        payload.adult2Price = parseInt(payload.adult2Price) || 0;
        payload.extraAdultPrice = parseInt(payload.extraAdultPrice) || 0;
        payload.childPrice = parseInt(payload.childPrice) || 0;

        if (!payload.ratePlan) delete payload.ratePlan;
        if (!payload.planImage) delete payload.planImage;

        if (payload.adult1Price < 0 || payload.adult2Price < 0 || payload.extraAdultPrice < 0 || payload.childPrice < 0) {
            return alert('Price cannot be negative');
        }

        try {
            if (editingPlan) {
                await api.put(`/pricing/${editingPlan._id}`, payload);
            } else {
                await api.post('/pricing', payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Submission Error:', error.response?.data || error.message);
            alert('Operation failed. Please check all fields.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this pricing plan?')) return;
        try {
            await api.delete(`/pricing/${id}`);
            fetchData();
        } catch (error) { console.error(error); }
    };

    if (loading) return (
        <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
    );

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">
                        Yield <span className="text-emerald-600 italic">Management</span>
                    </h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium">
                        Configure pricing plans per room variant · {plans.length} plans active
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="w-full sm:w-auto bg-secondary text-white px-6 lg:px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] lg:text-[10px] shadow-xl hover:shadow-secondary/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" /> New Plan
                </button>
            </header>

            {/* Plans Grid */}
            {plans.length === 0 ? (
                <div className="py-24 text-center text-slate-300">
                    <Coffee size={40} className="mx-auto mb-4 opacity-40" />
                    <p className="font-bold uppercase tracking-widest text-[10px]">No pricing plans configured yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {plans.map(plan => {
                        const variantName = plan.roomVariant?.name || '—';
                        const roomTypeName = plan.roomVariant?.roomType?.name || '—';
                        return (
                            <div key={plan._id} className="bg-white rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 border border-slate-100 shadow-sm relative group overflow-hidden hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-1 active:scale-95">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700" />
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative z-10">
                                    <div className="space-y-3 flex-grow min-w-0">
                                        <div className="flex gap-1.5 lg:gap-2 flex-wrap">
                                            <span className="text-[6px] lg:text-[7px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl border border-emerald-100/50 truncate max-w-[150px]">
                                                {roomTypeName}
                                            </span>
                                            <span className="text-[6px] lg:text-[7px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl border border-primary/10 truncate max-w-[150px]">
                                                {variantName}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg lg:text-xl font-black text-secondary tracking-tighter leading-none lowercase truncate">
                                                    {plan.planName.split(' ')[0]} <span className="text-primary italic">{plan.planName.split(' ').slice(1).join(' ')}</span>
                                                </h3>
                                                {plan.ratePlan && (
                                                    <span className="px-1.5 py-0.5 bg-secondary text-primary text-[6px] lg:text-[7px] font-black uppercase tracking-[0.3em] rounded shadow-sm shrink-0">
                                                        {plan.ratePlan.code}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                <p className="text-[7px] lg:text-[8px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1">{plan.mealsIncluded || 'Standard Occupancy'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-x-4 sm:group-hover:translate-x-0 w-full sm:w-auto">
                                        <button onClick={() => openEdit(plan)} className="flex-1 sm:w-10 sm:h-10 bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 rounded-xl flex items-center justify-center p-2.5 sm:p-0 transition-all shadow-sm">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(plan._id)} className="flex-1 sm:w-10 sm:h-10 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-xl flex items-center justify-center p-2.5 sm:p-0 transition-all shadow-sm">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>


                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 relative z-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 lg:right-8 lg:top-8 text-slate-400 hover:text-secondary p-2 bg-slate-50 rounded-lg lg:bg-transparent">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize mb-6 lg:mb-8 pr-12">
                            {editingPlan ? 'Refine' : 'Architect'} <span className="text-emerald-600 italic">Rate Plan</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">

                            {/* Step 1: Room Type */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    1 · Select Room Type
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none appearance-none"
                                        value={selectedRoomType}
                                        onChange={e => {
                                            setSelectedRoomType(e.target.value);
                                            setFormData(f => ({ ...f, roomVariant: '' }));
                                        }}
                                    >
                                        <option value="">Choose room type...</option>
                                        {roomTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Step 2: Variant */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    2 · Select Variant
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        disabled={!selectedRoomType || variants.length === 0}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none appearance-none disabled:opacity-40"
                                        value={formData.roomVariant}
                                        onChange={e => setFormData(f => ({ ...f, roomVariant: e.target.value }))}
                                    >
                                        <option value="">{selectedRoomType ? (variants.length ? 'Choose variant...' : 'No variants found') : 'Select a room type first'}</option>
                                        {variants.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Step 3: Rate Plan (Global Strategy) */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    3 · Link Global Rate Strategy
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none appearance-none"
                                        value={formData.ratePlan}
                                        onChange={e => handleRatePlanChange(e.target.value)}
                                    >
                                        <option value="">Custom Plan (Manual Name)...</option>
                                        {ratePlans.map(rp => (
                                            <option key={rp._id} value={rp._id}>{rp.name} ({rp.code})</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Plan Name */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Display Name</label>
                                <input required placeholder="Room with Breakfast" className="w-full bg-white border border-slate-100 shadow-inner rounded-2xl px-5 py-4 text-xs font-bold outline-none"
                                    value={formData.planName} onChange={e => setFormData(f => ({ ...f, planName: e.target.value }))} />
                            </div>

                            {/* Meals */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Meals Included</label>
                                <input required placeholder="Breakfast Only / All Meals / None" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none"
                                    value={formData.mealsIncluded} onChange={e => setFormData(f => ({ ...f, mealsIncluded: e.target.value }))} />
                            </div>

                            {/* Prices */}
                            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">1 Guest</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300">₹</span>
                                        <input type="number" required min="0" placeholder="0"
                                            className="w-full bg-white border border-slate-100 rounded-xl pl-6 pr-3 py-2.5 text-[11px] font-black outline-none focus:border-emerald-500 transition-all shadow-inner"
                                            value={formData.adult1Price} onChange={e => setFormData(f => ({ ...f, adult1Price: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">2 Guests</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300">₹</span>
                                        <input type="number" required min="0" placeholder="0"
                                            className="w-full bg-white border border-slate-100 rounded-xl pl-6 pr-3 py-2.5 text-[11px] font-black outline-none focus:border-emerald-500 transition-all shadow-inner"
                                            value={formData.adult2Price} onChange={e => setFormData(f => ({ ...f, adult2Price: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Extra Adult</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300">₹</span>
                                        <input type="number" required min="0" placeholder="0"
                                            className="w-full bg-white border border-slate-100 rounded-xl pl-6 pr-3 py-2.5 text-[11px] font-black outline-none focus:border-emerald-500 transition-all shadow-inner"
                                            value={formData.extraAdultPrice} onChange={e => setFormData(f => ({ ...f, extraAdultPrice: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Child</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300">₹</span>
                                        <input type="number" required min="0" placeholder="0"
                                            className="w-full bg-white border border-slate-100 rounded-xl pl-6 pr-3 py-2.5 text-[11px] font-black outline-none focus:border-emerald-500 transition-all shadow-inner"
                                            value={formData.childPrice} onChange={e => setFormData(f => ({ ...f, childPrice: e.target.value }))} />
                                    </div>
                                </div>
                            </div>

                            {/* Plan Image */}
                            <div className="md:col-span-2 space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 upper-case tracking-widest block">Digital Asset (Card Image)</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-white rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                                        {formData.planImage ? (
                                            <img src={formData.planImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-[10px] font-black text-slate-200 uppercase">Empty</div>
                                        )}
                                        {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="plan-img-upload" />
                                        <label htmlFor="plan-img-upload" className="inline-block bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest cursor-pointer hover:border-primary/30 transition-all">
                                            {uploading ? 'Processing...' : 'Change Asset'}
                                        </label>
                                        <p className="text-[8px] text-slate-400 mt-2">Recommended: 800x600 · Cloudinary Secured</p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button type="submit"
                                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all hover:bg-emerald-700">
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingMgmt;
