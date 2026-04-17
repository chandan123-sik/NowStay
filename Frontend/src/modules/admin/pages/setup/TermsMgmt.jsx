import { useState, useEffect } from 'react';
import {
    Save, Plus, Trash2, Scale, Clock, AlertCircle, FileText,
    Shield, Lock, Users, Gavel, DoorOpen, CreditCard, Ban, Globe, Anchor, FileWarning
} from 'lucide-react';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';

const ICONS = [
    'Shield', 'FileText', 'Lock', 'Users', 'AlertCircle', 'Scale',
    'Gavel', 'DoorOpen', 'CreditCard', 'Ban', 'Globe', 'Anchor', 'FileWarning'
];

const TermsMgmt = () => {
    const [terms, setTerms] = useState({ lastUpdated: '', sections: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchTerms = async () => {
        try {
            const { data } = await api.get('/terms');
            setTerms({
                ...data,
                sections: Array.isArray(data.sections) ? data.sections : []
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    const handleAdd = () => {
        setTerms(prev => {
            const currentSections = Array.isArray(prev?.sections) ? prev.sections : [];
            return {
                ...prev,
                sections: [...currentSections, { icon: 'FileText', title: '', content: '' }]
            };
        });
        toast.success('New legal clause initialized.');
    };

    const handleRemove = (idx) => {
        setTerms(prev => ({
            ...prev,
            sections: (prev.sections || []).filter((_, i) => i !== idx)
        }));
    };

    const handleSectionChange = (idx, field, val) => {
        setTerms(prev => {
            const newSections = (prev.sections || []).map((section, i) =>
                i === idx ? { ...section, [field]: val } : section
            );
            return { ...prev, sections: newSections };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Only send the data fields to avoid versioning or ID conflicts
            const payload = {
                lastUpdated: terms.lastUpdated,
                sections: terms.sections
            };
            await api.post('/terms', payload);
            toast.success('Legal protocols synchronized successfully.');
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Synchronization failure.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 text-left pb-20">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Legal <span className="text-primary italic">Protocols</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight mt-1">Configure the terms and conditions governing the NowStay platform.</p>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={handleAdd} className="px-6 py-3 bg-white border border-slate-900 text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Plus size={14} strokeWidth={3} /> ADD CLAUSE
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-secondary/10 flex items-center gap-2"
                    >
                        {saving ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                        Synchronize Vault
                    </button>
                </div>
            </header>

            <div className="max-w-4xl space-y-8">
                <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                    <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                        <div className="space-y-1.5 flex-grow">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={10} className="text-primary" /> Temporal Marker
                            </label>
                            <input
                                type="text"
                                value={terms.lastUpdated}
                                onChange={e => setTerms(prev => ({ ...prev, lastUpdated: e.target.value }))}
                                placeholder="e.g. October 15, 2025"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-xs lg:text-sm px-4 py-3 rounded-xl outline-none transition-all font-bold text-secondary"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="shrink-0 p-4 bg-primary/10 rounded-2xl border border-primary/20 hover:bg-primary transition-all active:scale-90 group/scale disabled:opacity-50"
                        >
                            <Scale size={20} className="text-primary group-hover/scale:text-secondary transition-colors" />
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {(terms.sections || []).map((section, idx) => (
                        <div key={idx} className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-4 duration-500 delay-100 relative group hover:border-primary/20 transition-colors">
                            <button
                                type="button"
                                onClick={() => handleRemove(idx)}
                                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Visual Token</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {ICONS.map(iconName => (
                                                <button
                                                    key={iconName}
                                                    type="button"
                                                    onClick={() => handleSectionChange(idx, 'icon', iconName)}
                                                    className={`p-2 rounded-lg border flex items-center justify-center transition-all 
                                                        ${section.icon === iconName ? 'bg-primary border-primary text-secondary scale-110 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-primary/30'}`}
                                                >
                                                    {(() => {
                                                        const icons = { Shield, FileText, Lock, Users, AlertCircle, Scale, Gavel, DoorOpen, CreditCard, Ban, Globe, Anchor, FileWarning };
                                                        const IconComp = icons[iconName] || FileText;
                                                        return <IconComp size={14} />;
                                                    })()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-3 space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clause Title</label>
                                        <input
                                            type="text"
                                            value={section.title}
                                            onChange={e => handleSectionChange(idx, 'title', e.target.value)}
                                            placeholder="e.g. Agreement to Terms"
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-xs lg:text-sm px-4 py-3 rounded-xl outline-none transition-all font-black text-secondary leading-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legal Narrative</label>
                                        <textarea
                                            rows="4"
                                            value={section.content}
                                            onChange={e => handleSectionChange(idx, 'content', e.target.value)}
                                            placeholder="Detailed textual transmission of the legal protocol..."
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-xs lg:text-sm px-4 py-3 rounded-xl outline-none transition-all font-medium text-slate-500 leading-relaxed italic resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {(!terms.sections || terms.sections.length === 0) && (
                    <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <FileText size={40} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No legal clauses detected in the ledger.</p>
                        <button type="button" onClick={handleAdd} className="mt-4 text-primary font-black text-[9px] uppercase tracking-widest border-b border-primary/40">Initialize First Clause</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TermsMgmt;
