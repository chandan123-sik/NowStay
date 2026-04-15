import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { Save, Calendar, Check, X, Building2, ChevronDown, Loader2, BedDouble, Ban, Users, UtensilsCrossed, AlertCircle, CheckCircle2 } from 'lucide-react';

const BulkUpdate = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [variants, setVariants] = useState([]);
    const [pricingPlans, setPricingPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        roomTypeId: '',
        variantId: '',
        fromDate: '',
        toDate: '',
        selectedDays: {
            mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true
        },
        updates: {
            roomsToSell: '',
            isStopSell: false,
        },
        activeTypes: {
            availability: true,
            rate: true,
            stopSell: true,
            adultRate: true,
            childRate: true
        },
        // Per-plan rate overrides: { [planId]: { adult1Price, adult2Price, extraAdultPrice, childPrice, dontSend } }
        planRates: {},
    });

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        api.get('/rooms').then(res => setRoomTypes(res.data)).catch(console.error);
    }, []);

    // When room type changes, fetch variants
    const handleRoomTypeChange = async (roomTypeId) => {
        setFormData(prev => ({ ...prev, roomTypeId, variantId: '', planRates: {} }));
        setPricingPlans([]);
        setSelectedRoomType(roomTypes.find(rt => rt._id === roomTypeId) || null);

        if (!roomTypeId) {
            setVariants([]);
            return;
        }

        setLoading(true);
        try {
            // Use the inventory matrix to get variants (same pattern as Availability.jsx)
            const { data } = await api.get(`/inventory/matrix?roomTypeId=${roomTypeId}`);
            setVariants(data.matrix || []);

            // Auto-select first variant to immediately show pricing
            if (data.matrix?.length >= 1) {
                handleVariantChange(data.matrix[0]._id, roomTypeId);
            }
        } catch (err) {
            console.error('Error fetching variants:', err);
            setVariants([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch date-aware rates from the matrix
    const fetchDateAwareRates = async (variantId, fromDate, roomTypeIdOverride = formData.roomTypeId) => {
        if (!variantId || !fromDate || !roomTypeIdOverride) return;
        try {
            const { data } = await api.get(`/inventory/matrix?startDate=${fromDate}&roomTypeId=${roomTypeIdOverride}`);
            const variantData = data.matrix?.find(m => m._id === variantId);
            if (!variantData) return;

            setFormData(prev => {
                const newPlanRates = { ...prev.planRates };
                variantData.plans.forEach(plan => {
                    const firstDayRate = plan.dailyRates[0];
                    if (firstDayRate) {
                        newPlanRates[plan.planId] = {
                            ...(newPlanRates[plan.planId] || {}),
                            adult1Price: firstDayRate.adult1Price ?? '',
                            adult2Price: firstDayRate.adult2Price ?? '',
                            extraAdultPrice: firstDayRate.extraAdultPrice ?? '',
                            childPrice: firstDayRate.childPrice ?? '',
                            dontSend: false,
                        };
                    }
                });
                return { ...prev, planRates: newPlanRates };
            });
        } catch (err) {
            console.error('Error fetching date-aware rates:', err);
        }
    };

    // When variant changes, fetch pricing plans
    const handleVariantChange = async (variantId, roomTypeIdOverride = formData.roomTypeId) => {
        setFormData(prev => ({ ...prev, variantId }));

        if (!variantId) {
            setPricingPlans([]);
            return;
        }

        try {
            // First get the base plans to ensure we have all plans metadata
            const { data } = await api.get(`/rooms/pricing/${variantId}`);
            setPricingPlans(data || []);

            // Initialize planRates with existing plan prices (Static Pricing defaults)
            const planRates = {};
            (data || []).forEach(plan => {
                planRates[plan._id] = {
                    adult1Price: plan.adult1Price || '',
                    adult2Price: plan.adult2Price || '',
                    extraAdultPrice: plan.extraAdultPrice || '',
                    childPrice: plan.childPrice || '',
                    dontSend: false,
                };
            });
            setFormData(prev => ({ ...prev, planRates }));

            // If we have a date, override static defaults with inventory matrix overrides
            if (formData.fromDate) {
                fetchDateAwareRates(variantId, formData.fromDate, roomTypeIdOverride);
            }
        } catch (err) {
            console.error('Error fetching pricing:', err);
            setPricingPlans([]);
        }
    };

    // Refresh rates when date range or variant changes to sync with Rates page
    useEffect(() => {
        if (formData.variantId && formData.fromDate) {
            fetchDateAwareRates(formData.variantId, formData.fromDate);
        }
    }, [formData.fromDate, formData.variantId]);

    const toggleDay = (day) => {
        setFormData(prev => ({
            ...prev,
            selectedDays: { ...prev.selectedDays, [day]: !prev.selectedDays[day] }
        }));
    };

    const toggleUpdateType = (type) => {
        setFormData(prev => ({
            ...prev,
            activeTypes: { ...prev.activeTypes, [type]: !prev.activeTypes[type] }
        }));
    };

    const updatePlanRate = (planId, field, value) => {
        setFormData(prev => ({
            ...prev,
            planRates: {
                ...prev.planRates,
                [planId]: {
                    ...(prev.planRates[planId] || {}),
                    [field]: value
                }
            }
        }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.variantId) {
            showToast('Please select a room type and variant', 'error');
            return;
        }
        if (!formData.fromDate || !formData.toDate) {
            showToast('Please select both From and To dates', 'error');
            return;
        }
        if (new Date(formData.fromDate) > new Date(formData.toDate)) {
            showToast('From date cannot be after To date', 'error');
            return;
        }

        // Check at least one day is selected
        const anyDaySelected = Object.values(formData.selectedDays).some(v => v);
        if (!anyDaySelected) {
            showToast('Please select at least one day', 'error');
            return;
        }

        setSaving(true);
        try {
            // Build updates payload (availability & stop sell)
            const updates = {};

            if (formData.activeTypes.availability && formData.updates.roomsToSell !== '') {
                updates.roomsToSell = Math.max(0, parseInt(formData.updates.roomsToSell) || 0);
            }
            if (formData.activeTypes.stopSell) {
                updates.isStopSell = formData.updates.isStopSell;
            }

            // Build per-plan rate updates
            const planUpdates = [];
            if (formData.activeTypes.rate || formData.activeTypes.adultRate || formData.activeTypes.childRate) {
                pricingPlans.forEach(plan => {
                    const rates = formData.planRates[plan._id];
                    if (!rates || rates.dontSend) return; // Skip plans marked "Don't Send"

                    const planUpdate = { planId: plan._id };
                    let hasUpdate = false;

                    if (formData.activeTypes.rate) {
                        if (rates.adult1Price !== '' && rates.adult1Price !== undefined) {
                            planUpdate.adult1Price = parseInt(rates.adult1Price);
                            hasUpdate = true;
                        }
                        if (rates.adult2Price !== '' && rates.adult2Price !== undefined) {
                            planUpdate.adult2Price = parseInt(rates.adult2Price);
                            hasUpdate = true;
                        }
                    }
                    if (formData.activeTypes.adultRate) {
                        if (rates.extraAdultPrice !== '' && rates.extraAdultPrice !== undefined) {
                            planUpdate.extraAdultPrice = parseInt(rates.extraAdultPrice);
                            hasUpdate = true;
                        }
                    }
                    if (formData.activeTypes.childRate) {
                        if (rates.childPrice !== '' && rates.childPrice !== undefined) {
                            planUpdate.childPrice = parseInt(rates.childPrice);
                            hasUpdate = true;
                        }
                    }

                    if (hasUpdate) planUpdates.push(planUpdate);
                });
            }

            await api.post('/inventory/bulk-update', {
                roomTypeId: formData.roomTypeId,
                variantId: formData.variantId,
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                selectedDays: formData.selectedDays,
                updates,
                planUpdates
            });

            showToast('Bulk update completed successfully!', 'success');
        } catch (error) {
            console.error('Bulk update error:', error);
            const msg = error.response?.data?.message || 'Bulk update failed. Please try again.';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const days = [
        { key: 'mon', label: 'Monday' },
        { key: 'tue', label: 'Tuesday' },
        { key: 'wed', label: 'Wednesday' },
        { key: 'thu', label: 'Thursday' },
        { key: 'fri', label: 'Friday' },
        { key: 'sat', label: 'Saturday' },
        { key: 'sun', label: 'Sunday' }
    ];

    const selectedVariant = variants.find(v => v._id === formData.variantId);

    // Plan color schemes using theme tokens (primary, secondary, accent)
    const planColors = [
        { bg: 'bg-primary', border: 'border-primary/30', light: 'bg-primary/5', text: 'text-primary' },
        { bg: 'bg-secondary', border: 'border-secondary/20', light: 'bg-secondary/5', text: 'text-secondary' },
        { bg: 'bg-accent', border: 'border-accent/30', light: 'bg-accent/5', text: 'text-accent' },
        { bg: 'bg-primary-dark', border: 'border-primary-dark/30', light: 'bg-primary-dark/5', text: 'text-primary-dark' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-left pb-20 relative">
            {/* Saving Overlay */}
            {saving && (
                <div className="fixed inset-0 z-[300] bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-secondary text-white px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl animate-in zoom-in-95">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Processing Bulk Update...</span>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[500] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-primary text-white' : 'bg-rose-600 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-xs font-black uppercase tracking-wider">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Overview</p>
                    <h1 className="text-2xl font-black text-secondary lowercase capitalize tracking-tight leading-none">Bulk <span className="text-primary italic">Update</span></h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !formData.variantId}
                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-2 transition-all text-left ${formData.variantId ? 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
            </header>

            {/* Controls Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 lg:p-12 shadow-sm space-y-10">

                {/* Row 1: Room Type, From, To */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Room Type */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Room Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none appearance-none cursor-pointer focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
                                value={formData.roomTypeId}
                                onChange={e => handleRoomTypeChange(e.target.value)}
                            >
                                <option value="">Select room type</option>
                                {roomTypes.map(rt => <option key={rt._id} value={rt._id}>{rt.name}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* From Date */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            From <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
                            value={formData.fromDate}
                            onChange={e => setFormData(f => ({ ...f, fromDate: e.target.value }))}
                        />
                    </div>

                    {/* To Date */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            To <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            min={formData.fromDate || new Date().toISOString().split('T')[0]}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
                            value={formData.toDate}
                            onChange={e => setFormData(f => ({ ...f, toDate: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Row 2: Type Control + Day Selection */}
                {(() => {
                    const datesReady = formData.fromDate && formData.toDate; return (
                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-slate-50 transition-all duration-300 ${!datesReady ? 'opacity-40 pointer-events-none' : ''}`}>
                            {/* Update Types */}
                            <div className="space-y-6">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Type Control</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { key: 'availability', label: 'Availability' },
                                        { key: 'rate', label: 'Rate' },
                                        { key: 'stopSell', label: 'Stop Sell' },
                                        { key: 'adultRate', label: 'Adult Rate' },
                                        { key: 'childRate', label: 'Child Rate' }
                                    ].map(type => (
                                        <button
                                            key={type.key}
                                            disabled={!datesReady}
                                            onClick={() => toggleUpdateType(type.key)}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${formData.activeTypes[type.key] ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                                        >
                                            <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.activeTypes[type.key] ? 'bg-primary' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.activeTypes[type.key] ? 'left-5' : 'left-1'}`} />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${formData.activeTypes[type.key] ? 'text-primary' : 'text-slate-400'}`}>
                                                {type.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Days Selection */}
                            <div className="space-y-6">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Select days</label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {days.map(day => (
                                        <button
                                            key={day.key}
                                            disabled={!datesReady}
                                            onClick={() => toggleDay(day.key)}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${formData.selectedDays[day.key] ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                                        >
                                            <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.selectedDays[day.key] ? 'bg-primary' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.selectedDays[day.key] ? 'left-5' : 'left-1'}`} />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${formData.selectedDays[day.key] ? 'text-secondary' : 'text-slate-400'}`}>
                                                {day.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Selected Room Section */}
            {formData.roomTypeId && formData.fromDate && formData.toDate && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 lg:p-12 shadow-sm space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <BedDouble size={22} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-secondary tracking-tight leading-none">
                                Selected Room — <span className="text-primary uppercase">{selectedRoomType?.name || 'Loading...'}</span>
                            </h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure rates, availability & restrictions</p>
                        </div>
                    </div>

                    {/* Variant Selector (if multiple) */}
                    {variants.length > 1 && (
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Variant</label>
                            <div className="flex flex-wrap gap-3">
                                {variants.map(v => (
                                    <button
                                        key={v._id}
                                        onClick={() => handleVariantChange(v._id)}
                                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.variantId === v._id
                                            ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                                            : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                                            }`}
                                    >
                                        {v.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Availability + Stop Sell Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Room Availability */}
                        {formData.activeTypes.availability && (
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Room Availability <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all tabular-nums"
                                    placeholder={selectedVariant ? String(selectedVariant.totalRooms) : '0'}
                                    value={formData.updates.roomsToSell}
                                    onChange={e => setFormData(f => ({ ...f, updates: { ...f.updates, roomsToSell: e.target.value } }))}
                                />
                            </div>
                        )}

                        {/* Stop Sell */}
                        {formData.activeTypes.stopSell && (
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stop Sell</label>
                                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4">
                                    <button
                                        onClick={() => setFormData(f => ({ ...f, updates: { ...f.updates, isStopSell: !f.updates.isStopSell } }))}
                                        className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${formData.updates.isStopSell ? 'bg-rose-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all shadow-md ${formData.updates.isStopSell ? 'left-7' : 'left-1.5'}`} />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <Ban size={14} className={formData.updates.isStopSell ? 'text-rose-500' : 'text-slate-400'} />
                                        <span className={`text-[10px] font-black uppercase tracking-tight ${formData.updates.isStopSell ? 'text-rose-600' : 'text-slate-400'}`}>
                                            {formData.updates.isStopSell ? 'Blocked' : 'Open'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pricing Plans Cards */}
                    {pricingPlans.length > 0 && (formData.activeTypes.rate || formData.activeTypes.adultRate || formData.activeTypes.childRate) && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {pricingPlans.map((plan, idx) => {
                                    const color = planColors[idx % planColors.length];
                                    const rates = formData.planRates[plan._id] || {};
                                    const isDontSend = rates.dontSend || false;

                                    return (
                                        <div
                                            key={plan._id}
                                            className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${isDontSend ? 'opacity-50 border-slate-200' : color.border}`}
                                        >
                                            {/* Plan Header */}
                                            <div className={`${color.bg} px-6 py-4 text-white`}>
                                                <div className="flex items-center gap-3">
                                                    <UtensilsCrossed size={16} />
                                                    <h3 className="text-[11px] font-black uppercase tracking-wider leading-snug">{plan.planName}</h3>
                                                </div>
                                            </div>

                                            {/* Plan Body */}
                                            <div className={`p-6 space-y-5 ${isDontSend ? 'bg-slate-50' : 'bg-white'}`}>
                                                {/* Rate Fields */}
                                                {formData.activeTypes.rate && (
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rate</label>
                                                        <div className="space-y-2">
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary/30 transition-all tabular-nums"
                                                                    placeholder="Guest 1"
                                                                    disabled={isDontSend}
                                                                    value={rates.adult1Price || ''}
                                                                    onChange={(e) => updatePlanRate(plan._id, 'adult1Price', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary/30 transition-all tabular-nums"
                                                                    placeholder="Guest 2"
                                                                    disabled={isDontSend}
                                                                    value={rates.adult2Price || ''}
                                                                    onChange={(e) => updatePlanRate(plan._id, 'adult2Price', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Extra Adult Rate */}
                                                {formData.activeTypes.adultRate && (
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Extra Adult Rate</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary/30 transition-all tabular-nums"
                                                            placeholder="Extra Adult 1"
                                                            disabled={isDontSend}
                                                            value={rates.extraAdultPrice || ''}
                                                            onChange={(e) => updatePlanRate(plan._id, 'extraAdultPrice', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                {/* Extra Child Rate */}
                                                {formData.activeTypes.childRate && (
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Extra Child Rate</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary/30 transition-all tabular-nums"
                                                            placeholder="Extra Child 1"
                                                            disabled={isDontSend}
                                                            value={rates.childPrice || ''}
                                                            onChange={(e) => updatePlanRate(plan._id, 'childPrice', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                {/* Don't Send Toggle */}
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Don&apos;t Send</span>
                                                    <button
                                                        onClick={() => updatePlanRate(plan._id, 'dontSend', !isDontSend)}
                                                        className={`w-12 h-7 rounded-full relative transition-all shadow-inner ${isDontSend ? 'bg-primary' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isDontSend ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Loading state for pricing plans */}
                    {formData.variantId && pricingPlans.length === 0 && (
                        <div className="py-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                <UtensilsCrossed size={20} className="text-slate-300" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No pricing plans found for this variant</p>
                        </div>
                    )}

                    {/* Prompt to select variant */}
                    {!formData.variantId && variants.length > 0 && (
                        <div className="py-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                                <Building2 size={20} className="text-primary" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a variant above to configure rates</p>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {(!formData.roomTypeId || !formData.fromDate || !formData.toDate) && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-16 shadow-sm text-center space-y-4 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        {!formData.roomTypeId ? <BedDouble size={32} className="text-slate-200" /> : <Calendar size={32} className="text-slate-200" />}
                    </div>
                    <h3 className="text-sm font-black text-secondary uppercase tracking-wider">
                        {!formData.roomTypeId ? 'Select a Room Type' : 'Select Date Range'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-sm mx-auto">
                        {!formData.roomTypeId
                            ? 'Choose a room type above to configure bulk rate updates, availability controls, and restrictions'
                            : 'Fill in both From and To dates to view and configure rates, availability, and restrictions'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default BulkUpdate;
