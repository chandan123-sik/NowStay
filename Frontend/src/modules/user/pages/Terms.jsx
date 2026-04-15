import { useState, useEffect } from 'react';
import {
    Shield, FileText, Lock, Users, AlertCircle, Scale, Clock,
    Gavel, DoorOpen, CreditCard, Ban, Globe, Anchor, FileWarning
} from 'lucide-react';
import api from '../../../services/api';

const ICON_MAP = {
    Shield, FileText, Lock, Users, AlertCircle, Scale,
    Gavel, DoorOpen, CreditCard, Ban, Globe, Anchor, FileWarning
};

const Terms = () => {
    const [terms, setTerms] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTerms = async () => {
        try {
            const { data } = await api.get('/terms');
            setTerms(data);
        } catch (error) {
            console.error('Error fetching terms:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!terms) return null;

    const sections = terms.sections;
    const lastUpdated = terms.lastUpdated;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Elegant Header */}
            <div className="relative bg-secondary pt-16 pb-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, #c9a84c 0%, transparent 40%), radial-gradient(circle at 90% 10%, #c9a84c 0%, transparent 40%)' }} />
                <div className="relative z-10 px-6 text-center">
                    <div className="w-12 h-12 bg-primary/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                        <Scale size={24} className="text-primary" />
                    </div>
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.6em]">Legal Protocol</span>
                    <h1 className="text-3xl lg:text-5xl font-serif text-white mt-4 lowercase leading-tight capitalize">
                        Terms & <span className="text-primary italic">Conditions.</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={12} /> Last Revised: {lastUpdated}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-8 lg:p-16">
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-500 leading-relaxed text-sm lg:text-base italic mb-12 border-l-4 border-primary/20 pl-6">
                            Welcome to Hotel Ananya. Our terms are designed to ensure a safe, secure, and premium experience for all guests. Please read these transmissions carefully before engaging with our digital node.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                            {sections.map((section, idx) => {
                                const IconComp = ICON_MAP[section.icon] || FileText;
                                return (
                                    <div key={idx} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary border border-slate-100 shadow-sm">
                                                <IconComp size={20} />
                                            </div>
                                            <h3 className="text-secondary font-black text-sm lg:text-base uppercase tracking-tight">{section.title}</h3>
                                        </div>
                                        <p className="text-slate-500 text-xs lg:text-sm leading-relaxed font-medium">
                                            {section.content}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-20 pt-10 border-t border-slate-100">
                            <h4 className="text-secondary font-black text-xs uppercase tracking-[0.3em] mb-4">Contact for Legal Inquiries</h4>
                            <p className="text-slate-400 text-xs font-medium">
                                If you have questions regarding these protocols, please synchronize with our administration at:
                                <span className="text-primary font-bold ml-2 underline">legal@ananyahotel.com</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Return Button */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => window.history.back()}
                        className="px-10 py-4 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary transition-all active:scale-95 shadow-xl shadow-secondary/20"
                    >
                        Return to Previous Node
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Terms;
