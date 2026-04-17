import { useState, useEffect } from 'react';
import { Building2, MapPin, Globe, Phone, Mail, Clock, ShieldCheck, Camera } from 'lucide-react';
import api from '../../../../services/api';

const Property = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState({
        name: '', slogan: '', about: '', email: '', phone: '', website: '', address: '',
        checkInTime: '', checkOutTime: '', cancellationWindow: ''
    });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const { data } = await api.get('/setup/property');
                setProperty(data);
            } catch (error) {
                console.error('Error fetching property:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.put('/setup/property', property);
            setProperty(data);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Error saving property:', error);
            alert('Failed to sync metadata.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-700 relative text-left pb-10 lg:pb-0">
            {/* Success Toast */}
            {showToast && (
                <div className="fixed top-20 sm:top-24 right-4 sm:right-10 z-[100] bg-emerald-500 text-white px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-8 sm:slide-in-from-right-8 duration-500 font-bold text-xs sm:text-sm border border-emerald-400/20 backdrop-blur-md">
                    <ShieldCheck size={20} className="shrink-0" />
                    <p>Global Property Data Synced Successfully</p>
                </div>
            )}

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Property Aesthetics & <span className="text-primary italic">Identity</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight mt-1">Control the global settings and visual identity of NowStay.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-secondary text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-secondary/20 disabled:opacity-50 active:scale-95 group"
                >
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            <ShieldCheck size={16} className="group-hover:rotate-12 transition-transform text-primary shrink-0" />
                            Sync to Metadata
                        </>
                    )}
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Visual Identity */}
                <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                    <div className="bg-white rounded-[1.5rem] lg:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="h-40 lg:h-64 bg-secondary relative">
                            <img src="/hero-luxury.jpg" alt="Hero" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent" />
                            <div className="absolute -bottom-10 sm:-bottom-12 left-6 sm:left-12 group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-1.5 sm:p-2 shadow-2xl relative border-4 border-white/50">
                                    <div className="w-full h-full bg-slate-50 rounded-[1rem] sm:rounded-[1.8rem] flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner">
                                        <img src="/logo.png" alt="Logo" className="w-16 sm:w-20" />
                                    </div>
                                    <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2.5 bg-primary text-secondary rounded-lg sm:rounded-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-90">
                                        <Camera size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-14 sm:pt-20 pb-8 sm:pb-12 px-6 sm:px-12 space-y-8 lg:space-y-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Establishment Name</label>
                                    <input
                                        type="text"
                                        value={property.name}
                                        onChange={e => setProperty({ ...property, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4.5 font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/20 transition-all font-serif italic text-base sm:text-xl shadow-inner placeholder:opacity-30"
                                        placeholder="e.g. NowStay"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Official Branding Slogan</label>
                                    <input
                                        type="text"
                                        value={property.slogan}
                                        onChange={e => setProperty({ ...property, slogan: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4.5 font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs sm:text-sm italic placeholder:opacity-30 shadow-inner"
                                        placeholder="e.g. Luxury Redefined"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Property Chronicles (About)</label>
                                <textarea
                                    rows={4}
                                    value={property.about}
                                    onChange={e => setProperty({ ...property, about: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-4 sm:py-6 font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs sm:text-sm leading-relaxed resize-none shadow-inner min-h-[120px] sm:min-h-[160px]"
                                    placeholder="Tell the story of your establishment..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] p-6 lg:p-10 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-sm shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-black text-secondary lowercase capitalize tracking-tight text-base sm:text-xl">Contact <span className="text-primary italic">Architecture</span></h3>
                                <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global communication endpoints.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            {[
                                { icon: Globe, label: 'Official Website', field: 'website', placeholder: 'www.nowstay.com' },
                                { icon: Phone, label: 'Reservations Desk', field: 'phone', placeholder: '+91 000 000 0000' },
                                { icon: Mail, label: 'Concierge Email', field: 'email', placeholder: 'stay@nowstay.com' },
                                { icon: MapPin, label: 'Physical GPS', field: 'address', placeholder: 'Enter physical location' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-2.5 p-4 lg:p-5 bg-slate-50 rounded-xl lg:rounded-2xl border border-dotted border-slate-200 hover:border-primary/30 transition-colors group/item">
                                    <div className="flex items-center gap-2">
                                        <item.icon size={14} className="text-primary shrink-0 group-hover/item:scale-110 transition-transform" />
                                        <label className="text-[9px] lg:text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">{item.label}</label>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={item.placeholder}
                                        value={property[item.field]}
                                        onChange={e => setProperty({ ...property, [item.field]: e.target.value })}
                                        className="w-full bg-transparent border-none text-[10px] lg:text-xs font-black text-secondary outline-none focus:text-primary transition-colors placeholder:font-bold placeholder:italic placeholder:opacity-20"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: System Info */}
                <div className="space-y-6 lg:space-y-8">
                    <div className="bg-secondary p-8 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] text-white relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-125" />
                        <ShieldCheck size={40} className="text-primary mb-6 transition-transform group-hover:rotate-12" />
                        <h4 className="font-serif italic text-2xl lg:text-3xl mb-1 text-primary">Global <span className="text-white">Policies</span></h4>
                        <p className="text-[9px] lg:text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-6">Standard operating protocols.</p>

                        <div className="space-y-2 mt-8">
                            {[
                                { label: 'Check-in Standard', field: 'checkInTime', placeholder: '12:00 PM' },
                                { label: 'Check-out Standard', field: 'checkOutTime', placeholder: '10:00 AM' },
                                { label: 'Cancellation Window', field: 'cancellationWindow', placeholder: '24 Hours' },
                            ].map(policy => (
                                <div key={policy.field} className="py-5 sm:py-6 border-b border-white/5 last:border-0 group/field">
                                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-[0.1em] block mb-2.5 transition-colors group-hover/field:text-primary">{policy.label}</label>
                                    <input
                                        type="text"
                                        placeholder={policy.placeholder}
                                        value={property[policy.field]}
                                        onChange={e => setProperty({ ...property, [policy.field]: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 text-[10px] sm:text-xs font-black text-primary uppercase outline-none focus:border-primary focus:bg-white/10 transition-all shadow-inner tracking-widest placeholder:text-white/10"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary/5 rounded-[1.5rem] sm:rounded-[3rem] p-8 sm:p-10 border-2 border-dashed border-primary/20 flex flex-col items-center text-center group hover:bg-primary/10 transition-colors">
                        <Clock size={32} className="text-primary mb-4 transition-transform group-hover:rotate-180 duration-1000" />
                        <h4 className="text-secondary font-black text-[10px] sm:text-xs mb-1 tracking-widest uppercase">System Operational Time</h4>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold italic mb-6">Last global sync: <span className="text-secondary">{new Date(property.updatedAt || Date.now()).toLocaleTimeString()}</span></p>
                        <button className="text-secondary text-[8px] sm:text-[9px] font-black uppercase underline decoration-primary decoration-2 underline-offset-4 hover:text-primary transition-all active:scale-95">
                            Force Server Re-sync
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Property;
