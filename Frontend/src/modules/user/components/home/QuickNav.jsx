import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Coffee, Waves, Heart } from 'lucide-react';

const navItems = [
    { icon: Bed, name: 'Stay', color: 'text-primary', path: '/stay' },
    { icon: Coffee, name: 'Dine', color: 'text-blue-500', path: '/dine' },
    { icon: Waves, name: 'Dip', color: 'text-cyan-500', path: '/dip' },
    { icon: Heart, name: 'Care', color: 'text-rose-500', path: '/care' },
];

const QuickNav = () => {
    const navigate = useNavigate();

    return (
        <section className="pb-4">
            <div className="bg-white border-b border-slate-100 shadow-sm p-4 grid grid-cols-4 gap-4">
                {navItems.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => navigate(item.path)}
                        className="flex flex-col items-center space-y-1.5 group active:scale-95 transition-all"
                    >
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                            <item.icon size={22} className={item.color} strokeWidth={1.5} />
                        </div>
                        <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">{item.name}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default QuickNav;
