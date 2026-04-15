import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Phone } from 'lucide-react';

const SupportGrid = () => {
    const navigate = useNavigate();

    return (
        <section className="py-4 bg-slate-50">
            <div className="grid grid-cols-2 gap-px bg-slate-100 border-y border-slate-100">
                <div
                    onClick={() => navigate('/about')}
                    className="bg-white p-5 flex items-center space-x-3 active:scale-[0.98] transition-all cursor-pointer"
                >
                    <div className="w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg"><BookOpen size={16} /></div>
                    <div>
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest">Heritage</p>
                        <p className="text-[7px] font-bold text-slate-400 uppercase">Our Story</p>
                    </div>
                </div>
                <div
                    onClick={() => navigate('/contact')}
                    className="bg-white p-5 flex items-center space-x-3 active:scale-[0.98] transition-all cursor-pointer"
                >
                    <div className="w-8 h-8 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-lg"><Phone size={16} /></div>
                    <div>
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest">Support</p>
                        <p className="text-[7px] font-bold text-slate-400 uppercase">24/7 Help</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SupportGrid;
