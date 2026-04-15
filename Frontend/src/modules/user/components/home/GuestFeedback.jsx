import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
    { name: 'Rohan Sharma', text: 'An absolute sanctuary. The coastal views and the service redefined luxury for us.', rating: 5 },
    { name: 'Aditya Gupta', text: 'The Azure Spa experience was transformative. A must-visit destination in Digha.', rating: 5 },
    { name: 'Sneha Kapur', text: 'Elegant, modern, and deeply cultural. The attention to detail is simply world-class.', rating: 4 }
];

const GuestFeedback = () => {
    return (
        <section className="py-8 bg-cream border-b border-slate-100">
            <div className="px-4 mb-6">
                <span className="text-primary font-black uppercase tracking-[0.4em] text-[7px]">Experiences</span>
                <h2 className="text-xl font-serif text-secondary lowercase leading-tight">Guest <span className="text-primary italic">tales</span> & echoes.</h2>
            </div>

            <div className="flex overflow-x-auto px-4 pb-4 space-x-3 no-scrollbar snap-x">
                {reviews.map((review, i) => (
                    <div key={i} className="flex-shrink-0 w-64 bg-white p-5 rounded-xl border border-slate-100 shadow-sm snap-center space-y-3">
                        <div className="flex text-accent space-x-0.5">
                            {[...Array(review.rating)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                        </div>
                        <p className="text-[10px] text-secondary/70 leading-relaxed font-medium italic">"{review.text}"</p>
                        <div className="pt-2 border-t border-slate-50 flex items-center space-x-2">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[8px] font-black text-primary">{review.name[0]}</div>
                            <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">{review.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default GuestFeedback;
