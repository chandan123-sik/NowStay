import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Star, Maximize2, BedDouble, Users, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { getAmenityIcon } from '../../../utils/amenityIcons';

const RoomCard = ({ room, onBook, isBlocked }) => (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-500 group
        ${isBlocked ? 'opacity-70 grayscale-[0.2]' : 'hover:shadow-xl'}`}>
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
            <img src={room.images?.[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-transparent to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                <span className="bg-primary text-secondary text-[7px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Luxury Suite</span>
                <div className="flex items-center gap-1 bg-secondary/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                    <Star size={8} className="text-amber-400" fill="currentColor" />
                    <span className="text-white text-[8px] font-bold">4.9</span>
                </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                    <h3 className="text-white font-serif text-lg leading-tight uppercase">{room.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {[
                            { icon: Maximize2, label: room.size },
                            { icon: BedDouble, label: room.bedType },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-1">
                                <Icon size={8} className="text-white/60" />
                                <span className="text-white/70 text-[8px] font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-primary font-bold text-lg">₹{(room.startingPrice || 0).toLocaleString()}</p>
                    <p className="text-white/40 text-[7px] uppercase tracking-widest leading-none">/ Starting</p>
                </div>
            </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 font-sans">
            {/* Capacity */}
            <div className="flex items-center gap-2 text-slate-400">
                <Users size={12} className="text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{room.capacity} pax</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{room.availableRooms ?? room.totalRooms} keys available</span>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-1.5">
                {room.amenities?.map(amenity => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                        <div key={amenity} className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                            <Icon size={9} className="text-primary" />
                            <span className="text-[8px] font-bold text-secondary uppercase tracking-tighter">{amenity}</span>
                        </div>
                    );
                })}
            </div>

            <p className="text-slate-400 text-[10px] leading-relaxed font-medium italic pr-2">
                "Experience the pinnacle of boutique hospitality. Elegantly curated for your comfort."
            </p>

            {!isBlocked ? (
                <button onClick={() => onBook(room)}
                    className="w-full bg-secondary text-white py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-2">
                    Explore Variants <ChevronRight size={12} />
                </button>
            ) : (
                <div className="w-full bg-rose-50 text-rose-500 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100 flex items-center justify-center gap-2 italic">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                    Account Restricted
                </div>
            )}
        </div>
    </div>
);

const Rooms = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const isBlocked = user?.status === 'blocked';
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 10);
        return () => clearTimeout(timer);
    }, [location.key]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/rooms');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (location.state?.initialSearch) {
            setSearch(location.state.initialSearch);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const getRoomCategory = (name) => {
        const n = name.toLowerCase();
        if (n.includes('suite')) return 'Suite';
        if (n.includes('deluxe')) return 'Deluxe';
        if (n.includes('premium')) return 'Premium';
        if (n.includes('executive')) return 'Executive';
        return 'Standard';
    };

    const filtered = categories.filter(r => {
        const searchTerm = search.replace(/\s/g, '').toLowerCase();
        const roomName = r.name.replace(/\s/g, '').toLowerCase();
        const matchesSearch = roomName.includes(searchTerm);
        const matchesCategory = categoryFilter === 'All' || getRoomCategory(r.name) === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const uniqueCategories = ['All', ...new Set(categories.map(r => getRoomCategory(r.name)))];

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-6 md:pb-10">
            {/* Page Header */}
            <div className="bg-secondary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #c9a84c 0%, transparent 40%), radial-gradient(circle at 80% 10%, #c9a84c 0%, transparent 40%)' }} />
                <div className="relative z-10 px-6 pt-6 pb-2">
                    <span className="text-primary text-[7px] font-bold uppercase tracking-[0.5em]">Exclusive Living</span>
                    <h1 className="text-2xl font-serif text-white mt-1 lowercase leading-tight">
                        Our <span className="text-primary italic">Sanctuaries.</span>
                    </h1>
                    <p className="text-white/40 text-[10px] mt-2 font-medium leading-relaxed max-w-xs">
                        Boutique suites where coastal charm meets modern comfort. Crafted for those who seek the sublime.
                    </p>
                </div>
            </div>

            <div className="px-4 max-w-3xl mx-auto">
                {/* Search bar - clearly below header */}
                <div className="my-6 flex gap-3">
                    <div className="flex-1 relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex items-center px-4 gap-3">
                        <Search size={16} className="text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search room type..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 py-4 text-sm text-secondary font-medium outline-none bg-transparent placeholder:text-slate-300"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-slate-300 hover:text-secondary transition-colors">✕</button>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`w-14 h-14 rounded-2xl shadow-xl border flex items-center justify-center transition-all active:scale-90 ${isFilterOpen ? 'bg-primary text-white border-primary' : 'bg-white text-secondary border-slate-100 hover:bg-slate-50'}`}
                        >
                            <SlidersHorizontal size={18} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-3 bg-slate-50 border-b border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Filter by Category</p>
                                </div>
                                {uniqueCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setCategoryFilter(cat); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${categoryFilter === cat ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-slate-50'}`}
                                    >
                                        {cat === 'All' ? 'View All' : cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Count */}
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    {filtered.length} Suite{filtered.length !== 1 ? 's' : ''} Identified
                </p>

                {/* Cards */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                        {filtered.map(room => (
                            <RoomCard key={room.type} room={room} onBook={r => navigate('/book', { state: { room: r } })} isBlocked={isBlocked} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-3">
                        <Search size={36} className="text-slate-200 mx-auto" />
                        <p className="text-secondary font-serif text-lg">No rooms found</p>
                        <p className="text-slate-400 text-xs">Try a different search term</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rooms;

