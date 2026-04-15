import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, Star, Coffee, Shield, MapPin, ChevronRight, Users, Award, Clock } from 'lucide-react';

const stats = [
    { value: '46', label: 'Luxury Rooms' },
    { value: '4.9★', label: 'Guest Rating' },
    { value: '2min', label: 'To Beach' },
    { value: '24/7', label: 'Support' },
];

const highlights = [
    {
        icon: Waves, title: 'Beachside Location',
        desc: "Just a 2-minute walk to New Digha's pristine coastline. Wake up to the sound of the ocean.",
        color: 'text-cyan-500 bg-cyan-50'
    },
    {
        icon: Star, title: 'Premium Service',
        desc: 'Our hospitality team is available 24/7, trained to exceed every expectation.',
        color: 'text-primary bg-primary/10'
    },
    {
        icon: Coffee, title: 'Multi-Cuisine Dining',
        desc: 'From coastal seafood to global cuisines — our restaurant is an experience in itself.',
        color: 'text-orange-500 bg-orange-50'
    },
    {
        icon: Shield, title: 'Safe & Secure',
        desc: 'Round-the-clock security, digital locks, and a fully monitored property for peace of mind.',
        color: 'text-emerald-500 bg-emerald-50'
    },
];

const timeline = [
    { year: '2008', event: 'Hotel Ananya founded in New Digha, West Bengal.' },
    { year: '2013', event: 'Expanded to 46 rooms, added rooftop dining & poolside lounge.' },
    { year: '2018', event: 'Received "Best Boutique Hotel" recognition in Eastern India.' },
    { year: '2024', event: 'Launched Ananya Digital — app-based booking & wallet system.' },
    { year: '2026', event: 'Continuing to redefine coastal luxury for a new generation.' },
];

const About = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pb-6 md:pb-10">
            {/* Hero Section */}
            <div className="relative bg-secondary overflow-hidden">
                <div className="absolute inset-0"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=50)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18 }} />
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #c9a84c 0%, transparent 50%)' }} />

                <div className="relative z-10 px-6 pt-8 pb-1 max-w-3xl mx-auto">
                    <span className="text-primary text-[8px] font-black uppercase tracking-[0.5em]">Our Heritage</span>
                    <h1 className="text-3xl font-serif text-white mt-2 lowercase leading-tight">
                        Welcome to <span className="text-primary italic">Ananya Hotel.</span>
                    </h1>
                    <p className="text-white/55 text-sm mt-4 font-light leading-relaxed max-w-md">
                        Located just behind the first plot of sea line in New Digha — a haven for travelers seeking comfort, peace, and the sound of the ocean.
                    </p>
                    <div className="flex items-center gap-2 mt-5">
                        <MapPin size={12} className="text-primary" />
                        <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">New Digha, West Bengal - 721428</span>
                    </div>
                </div>
            </div>

            <div className="px-4 max-w-3xl mx-auto">
                {/* Stats Row — overlaps hero */}
                <div className="grid grid-cols-4 gap-2 -mt-1 mb-6">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-3 text-center">
                            <p className="text-secondary font-black text-base leading-none">{value}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Story Section */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
                    <div className="relative h-52 overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1545665277-5937489579f2?auto=format&fit=crop&w=800&q=80"
                            className="w-full h-full object-cover"
                            alt="Hotel Ananya"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 to-transparent" />
                        <div className="absolute bottom-4 left-5">
                            <p className="text-primary text-[8px] font-black uppercase tracking-widest">Since 2008</p>
                            <h2 className="text-white font-serif text-xl mt-0.5">Relax. Revitalize. Rejuvenate.</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-500 text-sm leading-relaxed font-light">
                            An ideal choice for friends, families & couples to relax and unwind. Give yourself a chance to get close to nature and experience the cool sea breeze. Our proximity to the beach — just a 2-minute walk — makes us one of the most sought-after staycations in New Digha.
                        </p>
                        <p className="text-slate-500 text-sm leading-relaxed font-light mt-4">
                            We offer a perfect blend of modern amenities and traditional hospitality, ensuring every guest feels at home while experiencing the finest coastal luxury.
                        </p>
                    </div>
                </div>

                {/* Highlights Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {highlights.map(({ icon: Icon, title, desc, color }) => (
                        <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <h3 className="text-secondary font-bold text-xs uppercase tracking-wider">{title}</h3>
                                <p className="text-slate-400 text-[10px] leading-relaxed mt-1">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
                    <div className="flex items-center gap-2 mb-5">
                        <Clock size={16} className="text-primary" />
                        <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Our Journey</h2>
                    </div>
                    <div className="space-y-4">
                        {timeline.map(({ year, event }, i) => (
                            <div key={year} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-black flex-shrink-0
                                        ${i === timeline.length - 1 ? 'bg-primary text-secondary' : 'bg-slate-100 text-secondary'}`}>
                                        {year.slice(2)}
                                    </div>
                                    {i < timeline.length - 1 && (
                                        <div className="w-[1px] flex-1 bg-slate-100 mt-1 min-h-[20px]" />
                                    )}
                                </div>
                                <div className="pb-4">
                                    <p className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${i === timeline.length - 1 ? 'text-primary' : 'text-slate-400'}`}>{year}</p>
                                    <p className="text-secondary text-xs font-medium leading-relaxed">{event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission Quote Banner */}
                <div className="bg-secondary rounded-2xl overflow-hidden relative mb-4">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #c9a84c 0%, transparent 50%)' }} />
                    <div className="relative z-10 p-8 text-center space-y-4">
                        <div className="flex items-center justify-center gap-1">
                            {[1, 2, 3].map(i => <Award key={i} size={16} className="text-primary" />)}
                        </div>
                        <blockquote className="text-white font-serif text-xl italic leading-relaxed">
                            "The hotel that makes every moment matter."
                        </blockquote>
                        <p className="text-white/50 text-xs font-light leading-relaxed max-w-sm mx-auto">
                            Our mission is to provide an unforgettable experience for every guest — from our attentive staff to our carefully designed rooms.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <button onClick={() => navigate('/rooms')}
                                className="flex items-center justify-center gap-2 bg-primary text-secondary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">
                                Explore Rooms <ChevronRight size={14} />
                            </button>
                            <button onClick={() => navigate('/contact')}
                                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
                                Contact Us <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Team / Values */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users size={14} className="text-primary" /> Why Choose Ananya
                    </h2>
                    <div className="space-y-3">
                        {[
                            'Boutique experience with personal attention to every guest',
                            'Sustainably designed rooms using eco-friendly materials',
                            'Partnered with local artisans and culinary experts',
                            'Flexible check-in / check-out for a stress-free stay',
                        ].map((point, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[8px] font-black flex-shrink-0 mt-0.5">
                                    {i + 1}
                                </div>
                                <p className="text-secondary text-xs font-medium leading-relaxed">{point}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;

