import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const InterstitialBanner = ({ tag, title, italicTitle, subtext, btnText, img, path, type = 'horizontal' }) => {
    const navigate = useNavigate();

    if (type === 'vertical') {
        return (
            <section className="bg-secondary relative h-56 overflow-hidden group active:scale-[0.99] transition-all">
                <img
                    src={img}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale-[0.8] group-hover:scale-110 transition-transform duration-[6s]"
                    alt={tag}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent"></div>
                <div className="relative z-10 h-full p-8 flex flex-col justify-end space-y-3">
                    <div className="flex items-center space-x-2">
                        <div className="h-[1px] w-8 bg-primary"></div>
                        <span className="text-primary font-bold uppercase tracking-[0.4em] text-[8px]">{tag}</span>
                    </div>
                    <h2 className="text-white text-3xl font-serif leading-none lowercase">{title} <span className="text-primary italic">{italicTitle}</span></h2>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest max-w-[240px] leading-relaxed">{subtext}</p>
                    <div className="flex space-x-4 pt-2">
                        <button
                            onClick={() => navigate(path)}
                            className="text-white text-[9px] font-bold uppercase tracking-widest border-b border-white/30 pb-1 flex items-center group/btn transition-all active:scale-95"
                        >
                            {btnText} <ChevronRight size={10} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="bg-secondary relative h-48 overflow-hidden group active:scale-[0.99] transition-all cursor-pointer" onClick={() => navigate(path)}>
            <img
                src={img}
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-110 transition-transform duration-[5s]"
                alt={tag}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-transparent to-transparent"></div>
            <div className="relative z-10 h-full p-6 flex flex-col justify-center space-y-2">
                <span className="text-primary font-bold uppercase tracking-[0.3em] text-[8px]">{tag}</span>
                <h2 className="text-white text-2xl font-serif leading-tight lowercase">{title} <span className="text-primary italic">{italicTitle}</span></h2>
                <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest max-w-[200px]">{subtext}</p>
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(path); }}
                    className="mt-2 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-5 py-2 rounded-lg w-fit shadow-lg shadow-primary/20 hover:scale-105 hover:bg-white hover:text-primary transition-all active:scale-95"
                >
                    {btnText}
                </button>
            </div>
        </section>
    );
};

export default InterstitialBanner;
