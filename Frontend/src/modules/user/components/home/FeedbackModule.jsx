import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeedbackModule = () => {
    const navigate = useNavigate();

    return (
        <section className="py-12 bg-cream border-t border-slate-100 px-6 text-center space-y-6">
            <div className="space-y-2">
                <span className="text-primary font-black uppercase tracking-[0.4em] text-[7px]">Guest voice</span>
                <h2 className="text-2xl font-serif text-secondary lowercase">Share your <span className="text-primary italic">echoes</span>.</h2>
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">Your feedback fuels our pursuit of perfection.</p>
            </div>

            <div className="max-w-xs mx-auto space-y-3">
                <button
                    onClick={() => navigate('/contact', { state: { subject: 'Feedback' } })}
                    className="w-full bg-secondary text-white text-[10px] font-black uppercase tracking-[0.3em] py-4 rounded-xl shadow-xl shadow-secondary/20 hover:bg-primary transition-all active:scale-95"
                >
                    Submit a Review
                </button>
                <div className="pt-2">
                    <p className="text-primary text-[8px] font-black uppercase tracking-[0.4em]">or call us at</p>
                    <p className="text-secondary font-serif text-lg tracking-wider">+91 74071 75567</p>
                </div>
            </div>

            <div className="flex justify-center space-x-2 opacity-20">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full"></div>)}
            </div>
        </section>
    );
};

export default FeedbackModule;
