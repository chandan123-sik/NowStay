import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Coffee, Star, Waves } from 'lucide-react';

const activities = [
    { icon: Bed, title: 'Presidential Suite Booked', time: '2 mins ago', detail: 'New reservation by Guest #882', color: 'bg-emerald-500', iconColor: 'text-emerald-500' },
    { icon: Coffee, title: 'Morning Brews Served', time: '14 mins ago', detail: 'Signature coffee delivered to Room 302', color: 'bg-orange-500', iconColor: 'text-orange-500' },
    { icon: Star, title: 'New 5-Star Review', time: '1 hr ago', detail: '"An absolute sanctuary of luxury"', color: 'bg-primary', iconColor: 'text-primary' },
    { icon: Waves, title: 'Poolside Lounge Open', time: '2 hrs ago', detail: 'Exclusive sunset hours started', color: 'bg-blue-500', iconColor: 'text-blue-500' },
];

const RecentActivity = () => {
    const navigate = useNavigate();

    return (
        <section className="bg-white py-8 border-t border-slate-100">
            <div className="px-4 mb-6 flex items-center justify-between">
                <div>
                    <span className="text-primary font-black uppercase tracking-[0.4em] text-[7px]">Real-time Pulse</span>
                    <h2 className="text-xl font-serif text-secondary lowercase">Recent <span className="text-primary italic">activity</span>.</h2>
                </div>
            </div>

            <div className="space-y-4 px-4">
                {activities.map((activity, i) => (
                    <div key={i} className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-xl transition-all duration-500 active:scale-[0.98]">
                        <div className={`flex-shrink-0 w-10 h-10 ${activity.iconColor} bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100`}>
                            <activity.icon size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <h4 className="text-[11px] font-black text-secondary tracking-tight uppercase truncate">{activity.title}</h4>
                                <span className="text-[8px] font-bold text-slate-400 uppercase ml-2">{activity.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-normal">{activity.detail}</p>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => navigate('/profile')}
                    className="w-full py-4 text-[9px] font-black text-primary uppercase tracking-[0.4em] hover:bg-primary/5 rounded-xl transition-colors active:scale-95 shadow-sm"
                >
                    View Complete Feed
                </button>
            </div>
        </section>
    );
};

export default RecentActivity;
