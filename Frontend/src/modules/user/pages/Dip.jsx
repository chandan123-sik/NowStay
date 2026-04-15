import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Waves, Info } from 'lucide-react';

const Dip = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDip = async () => {
            try {
                const { data } = await api.get('/services/dip');
                setItems(data);
            } catch (error) {
                console.error('Error fetching dip items:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDip();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtering Crystal Waters...</p>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pb-24 text-left">
            <header className="relative h-[40vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=80"
                    className="w-full h-full object-cover"
                    alt="Dip"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <div className="absolute bottom-10 left-8">
                    <h1 className="text-4xl font-black text-secondary lowercase capitalize">Azure <span className="text-primary italic">Oasis</span></h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 ml-1">Aquatic Rituals & Serenity</p>
                </div>
            </header>

            <div className="px-8 mt-10 space-y-12">
                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <Waves size={40} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-serif italic">Our pools are being prepared for your arrival.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {items.map((item) => (
                            <div key={item._id} className="group flex flex-col gap-4">
                                <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden relative shadow-sm group-hover:shadow-2xl transition-all duration-700">
                                    <img
                                        src={item.image || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        alt={item.name}
                                    />
                                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[9px] font-black uppercase tracking-widest text-secondary shadow-xl">
                                        {item.category}
                                    </div>
                                    {item.price > 0 && (
                                        <div className="absolute bottom-6 right-6 px-4 py-2 bg-primary text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                            ₹{item.price}
                                        </div>
                                    )}
                                </div>
                                <div className="px-4">
                                    <h3 className="text-xl font-black text-secondary uppercase tracking-tight">{item.name}</h3>
                                    <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed italic line-clamp-2">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dip;
