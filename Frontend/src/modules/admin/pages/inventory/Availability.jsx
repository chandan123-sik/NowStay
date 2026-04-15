import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import {
    ChevronLeft, ChevronRight, Search, Home, Ban, Copy, ChevronDown, Check, Save, Zap, AlertCircle, X, Loader2, Calendar
} from 'lucide-react';

const Availability = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [dates, setDates] = useState([]);
    const [matrix, setMatrix] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRT, setSelectedRT] = useState('all');
    const [pendingUpdates, setPendingUpdates] = useState({});

    const fetchData = async (s = startDate) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/inventory/matrix?startDate=${s}&roomTypeId=${selectedRT}`);
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
        const newD = d.toISOString().split('T')[0];
        setStartDate(newD);
        fetchData(newD);
    };

    const updateCell = (variantId, date, field, value) => {
        const sanitizedValue = field === 'roomsToSell' ? Math.max(0, value) : value;
        const key = `${variantId}-${date}`;
        setPendingUpdates(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || {
                    variantId,
                    date,
                    roomsToSell: matrix.find(m => m._id === variantId).availability.find(a => a.date === date).roomsToSell,
                    isStopSell: matrix.find(m => m._id === variantId).availability.find(a => a.date === date).isStopSell
                }),
                [field]: sanitizedValue
            }
        }));

        setMatrix(prev => prev.map(m => {
            if (m._id !== variantId) return m;
            return {
                ...m,
                availability: m.availability.map(a => {
                    if (a.date !== date) return a;
                    return { ...a, [field]: sanitizedValue };
                })
            };
        }));
    };

    const handleCopyAvailability = (variantId) => {
        const row = matrix.find(m => m._id === variantId);
        if (!row || !row.availability?.length) return;
        const firstVal = row.availability[0].roomsToSell;

        const newPending = { ...pendingUpdates };
        row.availability.forEach(a => {
            const key = `${variantId}-${a.date}`;
            newPending[key] = {
                ...(newPending[key] || {
                    variantId,
                    date: a.date,
                    roomsToSell: a.roomsToSell,
                    isStopSell: a.isStopSell
                }),
                roomsToSell: firstVal
            };
        });

        setPendingUpdates(newPending);
        setMatrix(prev => prev.map(m => {
            if (m._id !== variantId) return m;
            return {
                ...m,
                availability: m.availability.map(a => ({ ...a, roomsToSell: firstVal }))
            };
        }));
    };

    const handleStopSellAll = (variantId, checked) => {
        const row = matrix.find(m => m._id === variantId);
        if (!row || !row.availability?.length) return;

        const newPending = { ...pendingUpdates };
        row.availability.forEach(a => {
            const key = `${variantId}-${a.date}`;
            newPending[key] = {
                ...(newPending[key] || {
                    variantId,
                    date: a.date,
                    roomsToSell: a.roomsToSell,
                    isStopSell: a.isStopSell
                }),
                isStopSell: checked
            };
        });

        setPendingUpdates(newPending);
        setMatrix(prev => prev.map(m => {
            if (m._id !== variantId) return m;
            return {
                ...m,
                availability: m.availability.map(a => ({ ...a, isStopSell: checked }))
            };
        }));
    };

    const updateTotalRooms = async (variantId, newTotal) => {
        const sanitizedTotal = Math.max(0, newTotal);
        setSaving(true);
        try {
            await api.put(`/rooms/variants/${variantId}`, { totalRooms: sanitizedTotal });
            setMatrix(prev => prev.map(m => m._id === variantId ? { ...m, totalRooms: sanitizedTotal } : m));
        } catch (e) {
            alert('Failed to update base capacity');
        } finally {
            setSaving(false);
        }
    };



    const handleSaveMatrix = async () => {
        const updates = Object.values(pendingUpdates);
        if (updates.length === 0) return alert('No changes detected.');

        setSaving(true);
        try {
            await api.post('/inventory/save-batch', { updates });
            alert('Inventory saved');
            setPendingUpdates({});
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.message || error.message;
            alert('Save failed: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading && matrix.length === 0) return (
        <div className="p-20 text-center"><Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto" /></div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-left pb-20 overflow-hidden relative">
            {saving && (
                <div className="fixed inset-0 z-[300] bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-secondary text-white px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl animate-in zoom-in-95">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Processing Changes...</span>
                    </div>
                </div>
            )}

            {/* Top Navigation */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tighter leading-none mb-1">Inventory <span className="text-teal-600 italic font-medium">Board</span></h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Dynamic Availability & Capacity Controls</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">

                    <button
                        onClick={handleSaveMatrix}
                        disabled={Object.keys(pendingUpdates).length === 0}
                        className={`flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all flex items-center justify-center gap-2 ${Object.keys(pendingUpdates).length > 0 ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                        <Save size={14} /> Update All
                    </button>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 relative z-30 max-w-6xl mx-auto border-b-4 border-b-teal-500/10">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button onClick={() => navigateDate(-1)} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all active:scale-90 text-slate-400 shadow-inner flex-shrink-0"><ChevronLeft size={18} /></button>
                    <div className="flex-grow md:flex-grow-0 flex items-center gap-3 border border-slate-200 rounded-2xl px-4 sm:px-6 py-2.5 shadow-sm bg-white hover:border-teal-300 transition-colors">
                        <input type="date" min={new Date().toISOString().split('T')[0]} className="bg-transparent text-sm sm:text-base font-black outline-none text-secondary w-full" value={startDate} onChange={(e) => { setStartDate(e.target.value); fetchData(e.target.value); }} />
                    </div>
                    <button onClick={() => navigateDate(1)} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all active:scale-90 text-slate-400 shadow-inner flex-shrink-0"><ChevronRight size={18} /></button>
                </div>
                <div className="relative w-full md:w-56">
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm font-black outline-none appearance-none text-slate-700 shadow-inner lowercase capitalize focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/30 transition-all" value={selectedRT} onChange={(e) => { setSelectedRT(e.target.value); setTimeout(fetchData, 10); }}>
                        <option value="all">Filter: All Categories</option>
                        {roomTypes.map(rt => <option key={rt._id} value={rt._id}>{rt.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <button onClick={() => fetchData()} className="w-full md:w-auto bg-secondary text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-slate-800">
                    <Search size={14} className={loading ? 'animate-spin' : ''} /> Run Query
                </button>
            </div>

            {/* Matrix Board */}
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden border-b-8 border-b-slate-100">
                <div className="overflow-x-auto custom-scrollbar table-responsive-container">
                    <table className="w-full text-left border-collapse min-w-[1000px] sm:min-w-[1240px]">
                        <thead>
                            <tr className="bg-slate-50/10 border-b border-slate-100">
                                <th className="px-4 sm:px-10 py-8 sm:py-12 sticky left-0 bg-white z-20 border-r border-slate-100 min-w-[140px] sm:min-w-[340px] shadow-[15px_0_20px_-10px_rgba(0,0,0,0.03)] text-center">
                                    <p className="text-[9px] sm:text-[11px] font-black text-secondary tracking-[0.2em] sm:tracking-[0.3em] uppercase opacity-70">Room Logic</p>
                                </th>
                                {dates.map((d, i) => {
                                    const dateObj = new Date(d);
                                    const day = dateObj.getDay();
                                    const isWeekend = day === 0 || day === 6;

                                    const bgClass = isWeekend ? 'bg-rose-50/30' : '';
                                    const textClass = isWeekend ? 'text-rose-500' : 'text-slate-400';

                                    return (
                                        <th key={i} className={`px-4 py-8 text-center border-r border-slate-100 min-w-[115px] ${bgClass}`}>
                                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${textClass}`}>{dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</p>
                                            <p className="text-2xl font-black text-secondary leading-none">{dateObj.getDate()}</p>
                                            <p className="text-[7px] font-black text-slate-300 uppercase mt-1 tracking-[0.2em]">{dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</p>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row) => (
                                <React.Fragment key={row._id}>
                                    {/* Variant Header Row */}
                                    <tr className="bg-slate-50/40 border-t border-slate-100">
                                        <td colSpan={dates.length + 1} className="px-4 sm:px-10 py-4 sticky left-0 bg-slate-50/80 backdrop-blur-sm z-10 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
                                                    <span className="text-xs sm:text-sm font-black text-secondary lowercase capitalize tracking-tighter border-l-4 border-teal-500 pl-4 truncate max-w-[200px] sm:max-w-none">{row.name}</span>
                                                    <div className="flex items-center gap-3 sm:gap-4 text-[8px] sm:text-[9px] font-black uppercase">
                                                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                            Total:
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="w-8 sm:w-10 bg-transparent outline-none text-center font-black"
                                                                value={row.totalRooms}
                                                                onChange={(e) => updateTotalRooms(row._id, parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <span className="bg-amber-50 text-orange-500 px-3 py-1.5 rounded-xl border border-amber-100 whitespace-nowrap">Sale Limit: {row.totalRooms}</span>
                                                    </div>
                                                </div>
                                                {row.isStopSellGlobal && <span className="w-fit bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase animate-pulse">Global Stop Sell On</span>}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Availability Entry */}
                                    <tr className="group">
                                        <td className="px-4 sm:px-10 py-6 sm:py-8 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 shadow-[15px_0_20px_-10px_rgba(0,0,0,0.02)]">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-2.5 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase">
                                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-50 transition-colors shrink-0"><Home size={14} className="text-teal-400" /></div>
                                                    <span className="whitespace-nowrap">Units To Sell</span>
                                                </div>
                                                <button
                                                    onClick={() => handleCopyAvailability(row._id)}
                                                    className="w-fit bg-teal-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-[8px] sm:text-[9px] font-black uppercase flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all"
                                                >
                                                    <Copy size={12} /> Copy
                                                </button>
                                            </div>
                                        </td>
                                        {row.availability.map((a, i) => {
                                            const isSun = new Date(a.date).getDay() === 0;
                                            return (
                                                <td key={i} className={`px-2 sm:px-4 py-6 sm:py-8 border-r border-slate-100 transition-all ${isSun ? 'bg-rose-50/10' : ''}`}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className={`w-full bg-white border-2 border-slate-100 rounded-2xl px-2 sm:px-3 py-3 sm:py-4 text-center text-xs sm:text-sm font-black text-secondary shadow-sm outline-none transition-all ${a.isStopSell ? 'border-rose-100 bg-rose-50/50 text-rose-500/50 pointer-events-none' : 'focus:border-teal-500 focus:ring-8 focus:ring-teal-500/5'}`}
                                                        value={a.roomsToSell}
                                                        onChange={(e) => updateCell(row._id, a.date, 'roomsToSell', parseInt(e.target.value) || 0)}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Stop Sell Row */}
                                    <tr className="group border-b border-slate-100">
                                        <td className="px-4 sm:px-10 py-5 sm:py-6 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 shadow-[15px_0_20px_-10px_rgba(0,0,0,0.02)]">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-2.5 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase">
                                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-rose-50 transition-colors shrink-0"><Ban size={14} className="text-rose-400" /></div>
                                                    <span className="whitespace-nowrap">Stop Sell</span>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group/total text-slate-400 hover:text-rose-500 transition-colors" onClick={() => handleStopSellAll(row._id, !row.availability.every(a => a.isStopSell))}>
                                                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter">Toggle</span>
                                                    <div className={`w-8 sm:w-10 h-5 sm:h-6 rounded-full relative transition-all shadow-inner border border-slate-100 ${row.availability.every(a => a.isStopSell) ? 'bg-rose-500' : 'bg-slate-100'}`}>
                                                        <div className={`absolute top-0.5 sm:top-1 w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full transition-all ${row.availability.every(a => a.isStopSell) ? 'left-4 sm:left-5' : 'left-0.5'}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {row.availability.map((a, i) => (
                                            <td key={i} className="px-4 py-6 border-r border-slate-100 text-center">
                                                <div
                                                    onClick={() => updateCell(row._id, a.date, 'isStopSell', !a.isStopSell)}
                                                    className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center mx-auto transition-all cursor-pointer ${a.isStopSell ? 'bg-rose-500 border-rose-500 shadow-xl shadow-rose-200 scale-110' : 'bg-slate-50 border-slate-100 hover:border-slate-300 shadow-inner'}`}
                                                >
                                                    {a.isStopSell && <Check size={18} className="text-white" />}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


        </div >
    );
};

export default Availability;
