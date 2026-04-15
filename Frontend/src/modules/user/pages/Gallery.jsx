import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Maximize2, X, ChevronLeft, ChevronRight, Grid3X3, LayoutGrid } from 'lucide-react';

const FALLBACK_IMAGES = [
    { imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', type: 'Exterior', title: 'Hotel Facade' },
    { imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', type: 'Pool', title: 'Infinity Pool' },
    { imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80', type: 'Lobby', title: 'Grand Lobby' },
];

const CATEGORIES = ['All', 'Exterior', 'Rooms', 'Pool', 'Restaurant', 'Lobby', 'Events'];

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [lightboxIdx, setLightboxIdx] = useState(null);
    const [masonry, setMasonry] = useState(false);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const { data } = await api.get('/media/gallery');
                const activeOnly = data.filter(img => img.isActive !== false);
                setImages(activeOnly.length > 0 ? activeOnly : FALLBACK_IMAGES);
            } catch (error) {
                console.error('Gallery fetch error:', error);
                setImages(FALLBACK_IMAGES);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const filtered = filter === 'All' ? images : images.filter(img => (img.category || img.type) === filter);

    const openLightbox = (idx) => setLightboxIdx(idx);
    const closeLightbox = () => setLightboxIdx(null);
    const prev = () => setLightboxIdx(i => (i - 1 + filtered.length) % filtered.length);
    const next = () => setLightboxIdx(i => (i + 1) % filtered.length);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-6 md:pb-10">
            {/* Dark Hero Header */}
            <div className="relative bg-secondary overflow-hidden">
                <div className="absolute inset-0"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=60)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 15% 85%, #c9a84c 0%, transparent 40%), radial-gradient(circle at 85% 15%, #c9a84c 0%, transparent 40%)' }} />
                <div className="relative z-10 px-6 pt-8 pb-1">
                    <span className="text-primary text-[8px] font-black uppercase tracking-[0.5em]">Aesthetic Journey</span>
                    <h1 className="text-3xl font-serif text-white mt-2 lowercase leading-tight">
                        Our Visual <span className="text-primary italic">Story.</span>
                    </h1>
                    <p className="text-white/50 text-xs mt-3 font-medium leading-relaxed max-w-sm">
                        Capturing the soulful moments of boutique luxury — from golden dusks to refined interiors.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{images.length} Curated Photographs</span>
                    </div>
                </div>
            </div>

            <div className="px-4 max-w-4xl mx-auto">
                {/* Filter + View Toggle — overlaps header */}
                <div className="flex items-center gap-3 -mt-1 mb-4">
                    <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar bg-white rounded-2xl shadow-xl border border-slate-100 p-2">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setFilter(cat)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-90
                                    ${filter === cat ? 'bg-secondary text-white shadow-md' : 'text-slate-400 hover:text-secondary'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setMasonry(!masonry)}
                        className="w-12 h-12 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all active:scale-90 flex-shrink-0">
                        {masonry ? <Grid3X3 size={18} /> : <LayoutGrid size={18} />}
                    </button>
                </div>

                {/* Count */}
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    {filtered.length} Image{filtered.length !== 1 ? 's' : ''} · {filter}
                </p>

                {/* Grid */}
                <div className={`grid gap-3 ${masonry ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                    {filtered.map((img, idx) => (
                        <div key={idx}
                            onClick={() => openLightbox(idx)}
                            className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1
                                ${masonry && idx % 3 === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'}`}>
                            <img src={img.imageUrl} alt={img.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/40 transition-all duration-500 flex items-center justify-center">
                                <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" />
                            </div>
                            {/* Category + Label strip */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary/80 via-secondary/10 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                                <p className="text-white text-[9px] font-black uppercase tracking-widest">{img.title}</p>
                                <span className="bg-primary text-secondary text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest mt-1 inline-block">
                                    {img.type || img.category}
                                </span>
                            </div>
                            {/* Category chip always visible */}
                            <div className="absolute top-2 left-2 bg-secondary/60 backdrop-blur-sm text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {img.type || img.category}
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 text-center space-y-3">
                        <p className="text-secondary font-serif text-lg">No images in this category</p>
                        <button onClick={() => setFilter('All')} className="text-primary font-black text-xs uppercase tracking-widest hover:underline">
                            View All
                        </button>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIdx !== null && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                    <div className="absolute inset-0 bg-secondary/97 backdrop-blur-xl" onClick={closeLightbox} />

                    {/* Close */}
                    <button onClick={closeLightbox}
                        className="absolute top-5 right-5 w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-10 active:scale-90">
                        <X size={18} />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-5 left-5 bg-white/10 border border-white/20 rounded-full px-4 py-2 z-10">
                        <span className="text-white text-[9px] font-black uppercase tracking-widest">{lightboxIdx + 1} / {filtered.length}</span>
                    </div>

                    {/* Prev */}
                    <button onClick={prev}
                        className="absolute left-4 w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-10 active:scale-90">
                        <ChevronLeft size={20} />
                    </button>

                    {/* Image */}
                    <div className="relative z-10 max-w-[90vw] max-h-[80vh] flex flex-col items-center gap-3">
                        <img src={filtered[lightboxIdx].imageUrl} alt={filtered[lightboxIdx].title}
                            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl" />
                        <div className="text-center">
                            <p className="text-white font-bold text-sm">{filtered[lightboxIdx].title}</p>
                            <span className="text-primary text-[8px] font-black uppercase tracking-widest">{filtered[lightboxIdx].type || filtered[lightboxIdx].category}</span>
                        </div>
                    </div>

                    {/* Next */}
                    <button onClick={next}
                        className="absolute right-4 w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-10 active:scale-90">
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Gallery;

