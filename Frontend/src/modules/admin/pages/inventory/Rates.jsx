import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import {
    ChevronLeft, ChevronRight, Save, Search,
    Users, Copy, ChevronDown
} from 'lucide-react';

const Rates = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [dates, setDates] = useState([]);
    const [matrix, setMatrix] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRT, setSelectedRT] = useState('all');
    const [pendingUpdates, setPendingUpdates] = useState({}); // {roomTypeId-date: { planUpdates: [] }}

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/inventory/matrix?startDate=${startDate}&roomTypeId=${selectedRT}`);
            setDates(data.dates);
            setMatrix(data.matrix);
            setPendingUpdates({});
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        api.get('/rooms').then(res => setRoomTypes(res.data)).catch(console.error);
        fetchData();
    }, []);

    const navigateDate = (days) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + days);
        setStartDate(d.toISOString().split('T')[0]);
        setLoading(true);
        api.get(`/inventory/matrix?startDate=${d.toISOString().split('T')[0]}&roomTypeId=${selectedRT}`)
            .then(res => {
                setDates(res.data.dates);
                setMatrix(res.data.matrix);
                setLoading(false);
            });
    };

    const updateRate = (rtId, date, planId, field, value) => {
        const key = `${rtId}-${date}`;

        setPendingUpdates(prev => {
            const next = { ...prev };
            const current = next[key] || { roomTypeId: rtId, date, planUpdates: [] };

            // Create a deep copy of planUpdates to avoid reference issues
            const planUpdates = JSON.parse(JSON.stringify(current.planUpdates));
            let planUpdate = planUpdates.find(p => p.planId === planId);
            if (!planUpdate) {
                planUpdate = { planId };
                planUpdates.push(planUpdate);
            }
            planUpdate[field] = value;

            next[key] = { ...current, planUpdates };
            return next;
        });

        setMatrix(prev => prev.map(m => {
            if (m._id !== rtId) return m;
            return {
                ...m,
                plans: m.plans.map(p => {
                    if (p.planId !== planId) return p;
                    return {
                        ...p,
                        dailyRates: p.dailyRates.map(dr => {
                            if (dr.date !== date) return dr;
                            return { ...dr, [field]: value };
                        })
                    };
                })
            };
        }));
    };

    const handleCopyRate = (rtId, planId) => {
        const row = matrix.find(m => m._id === rtId);
        if (!row) return;
        const plan = row.plans.find(p => p.planId === planId);
        if (!plan || !plan.dailyRates?.length) return;

        const first = plan.dailyRates[0];
        const newUpdates = {};

        plan.dailyRates.forEach(dr => {
            const key = `${rtId}-${dr.date}`;
            const currentKeyUpdate = pendingUpdates[key] || { roomTypeId: rtId, date: dr.date, planUpdates: [] };

            // Create a local copy of planUpdates
            let planUpdates = [...currentKeyUpdate.planUpdates];
            let planUpdate = planUpdates.find(p => p.planId === planId);

            if (!planUpdate) {
                planUpdate = { planId };
                planUpdates.push(planUpdate);
            }

            planUpdate.adult1Price = first.adult1Price;
            planUpdate.adult2Price = first.adult2Price;
            planUpdate.extraAdultPrice = first.extraAdultPrice;
            planUpdate.childPrice = first.childPrice;

            newUpdates[key] = { ...currentKeyUpdate, planUpdates };
        });

        setPendingUpdates(prev => ({ ...prev, ...newUpdates }));
        setMatrix(prev => prev.map(m => {
            if (m._id !== rtId) return m;
            return {
                ...m,
                plans: m.plans.map(p => {
                    if (p.planId !== planId) return p;
                    return {
                        ...p,
                        dailyRates: p.dailyRates.map(dr => ({
                            ...dr,
                            adult1Price: first.adult1Price,
                            adult2Price: first.adult2Price,
                            extraAdultPrice: first.extraAdultPrice,
                            childPrice: first.childPrice
                        }))
                    };
                })
            };
        }));
    };

    const handleSave = async () => {
        const updates = Object.values(pendingUpdates);
        if (updates.length === 0) return alert('No changes to save.');
        setLoading(true);
        try {
            await api.post('/inventory/save-batch', { updates });
            alert('Rates saved successfully');
            fetchData();
        } catch (error) {
            alert('Save failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading && matrix.length === 0) return (
        <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
    );

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tighter leading-none mb-1">Yield <span className="text-emerald-600 italic">Matrix</span></h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Daily Pricing & Strategy Control</p>
                </div>
                <button
                    onClick={handleSave}
                    className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                    <Save size={14} /> Save Rates
                </button>
            </header>

            <div className="grid grid-cols-1 md:flex md:flex-wrap items-center gap-4 bg-white p-4 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button onClick={() => navigateDate(-1)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all active:scale-90 flex-shrink-0">
                        <ChevronLeft size={16} />
                    </button>
                    <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                    <button onClick={() => navigateDate(1)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all active:scale-90 flex-shrink-0">
                        <ChevronRight size={16} />
                    </button>
                </div>
                <div className="relative w-full md:w-64">
                    <select
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none appearance-none"
                        value={selectedRT}
                        onChange={e => setSelectedRT(e.target.value)}
                    >
                        <option value="all">All Room Types</option>
                        {roomTypes.map(rt => <option key={rt._id} value={rt._id}>{rt.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <button onClick={fetchData} className="w-full md:w-auto bg-secondary text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-secondary/10">
                    <Search size={14} /> Search
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden border-b-8 border-b-slate-100">
                <div className="overflow-x-auto custom-scrollbar table-responsive-container">
                    <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-[1400px]">
                        <thead>
                            <tr className="bg-slate-50/10">
                                <th className="px-4 sm:px-8 py-6 sm:py-10 sticky left-0 bg-white z-20 border-r border-slate-100 min-w-[100px] sm:min-w-[300px] shadow-[15px_0_20px_-10px_rgba(0,0,0,0.03)]">
                                    <p className="text-[7px] sm:text-[10px] font-black text-secondary tracking-[0.2em] uppercase opacity-70">Inventory <span className="text-emerald-600">Rates</span></p>
                                </th>
                                {dates.map((d, i) => {
                                    const dateObj = new Date(d);
                                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                                    return (
                                        <th key={i} className={`px-4 py-8 text-center border-r border-slate-100 min-w-[110px] ${isWeekend ? 'bg-rose-50/30' : ''}`}>
                                            <p className={`text-[9px] font-black uppercase tracking-tighter mb-1 ${isWeekend ? 'text-rose-500' : 'text-slate-400'}`}>{dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</p>
                                            <p className="text-xl font-black text-secondary leading-none">{dateObj.getDate()}</p>
                                            <p className="text-[7px] font-bold text-slate-300 uppercase mt-1 tracking-widest">{dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</p>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row) => (
                                <React.Fragment key={row._id}>
                                    <tr className="bg-white">
                                        <td colSpan={dates.length + 1} className="px-4 sm:px-8 py-3 border-b border-t border-slate-50 bg-slate-50/50 sticky left-0 z-10 w-full backdrop-blur-sm">
                                            <span className="text-[8px] sm:text-[10px] font-black text-secondary uppercase tracking-widest truncate block max-w-[180px] sm:max-w-none border-l-4 border-emerald-500 pl-3">{row.name}</span>
                                        </td>
                                    </tr>
                                    {row.plans && row.plans.length > 0 ? (
                                        row.plans.map((plan) => (
                                            <React.Fragment key={plan.planId}>
                                                {[
                                                    { label: '1 Guest', key: 'adult1Price' },
                                                    { label: '2 Guest', key: 'adult2Price' },
                                                    { label: 'Extra Adult', key: 'extraAdultPrice' },
                                                    { label: 'Extra Child', key: 'childPrice' }
                                                ].map((occ, occIdx) => (
                                                    <tr key={occ.key} className="group border-b border-slate-50">
                                                        <td className="px-3 sm:px-8 py-3 sm:py-5 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 transition-all shadow-[15px_0_20px_-10px_rgba(0,0,0,0.02)]">
                                                            <div className="flex flex-col gap-1.5 min-w-0">
                                                                {occIdx === 0 && (
                                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                                        <span className="text-[7px] sm:text-[9px] font-black text-emerald-600 uppercase truncate max-w-[80px] sm:max-w-[200px] leading-tight">
                                                                            {plan.planName}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleCopyRate(row._id, plan.planId)}
                                                                            className="shrink-0 bg-emerald-50 text-emerald-600 p-1 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                                                            title="Copy first date to all"
                                                                        >
                                                                            <Copy size={10} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                <span className="text-[6px] sm:text-[8px] font-black text-slate-400 uppercase flex items-center gap-1.5 whitespace-nowrap opacity-80">
                                                                    <Users size={10} className="text-slate-300 shrink-0" /> {occ.label}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {plan.dailyRates.map((dr, i) => (
                                                            <td key={i} className={`px-2 sm:px-4 py-3 sm:py-5 border-r border-slate-100 transition-all ${new Date(dr.date).getDay() === 0 ? 'bg-rose-50/10' : ''}`}>
                                                                <div className="relative group/input">
                                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[7px] font-bold text-slate-300 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors">₹</span>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-1 sm:px-3 py-2 sm:py-2.5 text-center text-[9px] sm:text-[11px] font-black text-secondary shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all tabular-nums outline-none"
                                                                        value={dr[occ.key]}
                                                                        onChange={(e) => updateRate(row._id, dr.date, plan.planId, occ.key, parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                                                                    />
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={dates.length + 1} className="px-8 py-10 text-center bg-slate-50/30">
                                                <div className="flex flex-col items-center gap-3">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Pricing Plans Active for this Variant</p>
                                                    <a href="/admin/setup/pricing" className="bg-white border border-slate-200 px-6 py-2 rounded-xl text-[9px] font-black text-emerald-600 uppercase tracking-widest shadow-sm hover:border-emerald-200 transition-all">
                                                        + Setup Pricing Plans Now
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Rates;
