import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { Save, Info, Check, CreditCard, ShieldCheck, Wallet, Percent, Shield, Zap, Sparkles } from 'lucide-react';

const PaymentSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        payAtHotelEnabled: true,
        partialPaymentPercentage: 25
    });

    useEffect(() => {
        api.get('/setup/property').then(res => {
            setSettings({
                payAtHotelEnabled: res.data.payAtHotelEnabled ?? true,
                partialPaymentPercentage: res.data.partialPaymentPercentage ?? 25
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/setup/property', settings);
            alert('Settings updated successfully!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading settings...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-left pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <label className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-1 block">Security & Settlement</label>
                    <h1 className="text-xl font-bold text-secondary uppercase tracking-tight leading-none">
                        Payment <span className="text-primary">Setups</span>
                    </h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-secondary px-6 py-2.5 rounded-sm font-bold uppercase tracking-widest text-[9px] shadow-sm flex items-center gap-2 hover:bg-secondary hover:text-white transition-all disabled:opacity-50"
                >
                    <Save size={14} /> {saving ? 'Saving...' : 'Commit Changes'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    {/* Master Switch Card */}
                    <div className="bg-white rounded-sm border border-slate-200 p-6 shadow-sm space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />

                        <div className="flex items-start justify-between relative">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-center text-primary">
                                        <Wallet size={16} />
                                    </div>
                                    <h2 className="text-xs font-bold text-secondary uppercase tracking-tight">Partial Payment Gateway</h2>
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 max-w-xs leading-relaxed">Limit initial dues to a specific percentage. Remaining balance is collected at check-in.</p>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, payAtHotelEnabled: !s.payAtHotelEnabled }))}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 ${settings.payAtHotelEnabled ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.payAtHotelEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {settings.payAtHotelEnabled && (
                            <div className="pt-8 border-t border-slate-50 space-y-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[9px] font-bold text-secondary uppercase tracking-widest ml-1">Percentage Setup (%)</label>
                                        <span className="text-xl font-bold text-primary tabular-nums">{settings.partialPaymentPercentage}% <span className="text-[9px] text-slate-400 uppercase ml-1">Initial</span></span>
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="range"
                                            min="0" max="100" step="5"
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                            value={settings.partialPaymentPercentage}
                                            onChange={e => setSettings(s => ({ ...s, partialPaymentPercentage: Number(e.target.value) }))}
                                        />
                                        <div className="flex justify-between mt-2 px-1">
                                            <span className="text-[8px] font-black text-slate-300 uppercase">0% (Zero Now)</span>
                                            <span className="text-[8px] font-black text-slate-300 uppercase">100% (Full Pay)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-sm p-4 border border-slate-200 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-sm shadow-sm flex items-center justify-center text-primary">
                                        <Percent size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Selected Mode</p>
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-tight">Guests pay {settings.partialPaymentPercentage}% online and {(100 - settings.partialPaymentPercentage)}% at the hotel.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-secondary p-8 rounded-sm text-white space-y-6 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 opacity-5 translate-x-1/4 translate-y-1/4">
                            <Shield size={160} />
                        </div>
                        <div className="w-11 h-11 bg-primary border border-primary/20 rounded-sm flex items-center justify-center text-secondary">
                            <ShieldCheck size={22} />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-bold uppercase tracking-tight leading-none">Security Protocol</h3>
                            <p className="text-[9px] font-bold text-white/50 uppercase leading-relaxed tracking-tight">Global payment logic affecting all room variants and rate plans.</p>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            {[
                                { label: 'Real-time Sync', icon: Zap },
                                { label: 'Encrypted Settlement', icon: ShieldCheck },
                                { label: 'Audit Trail Active', icon: Sparkles }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <item.icon size={13} className="text-primary" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-8 rounded-sm space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Info size={16} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Brand UI Sync</span>
                        </div>
                        <p className="text-[9px] font-bold text-primary/70 leading-relaxed uppercase tracking-tight">
                            The "Pay at Hotel" cards in the user flow will automatically update their labels (e.g., "{settings.partialPaymentPercentage}% now") once you commit these changes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSettings;
