import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../../../../services/api';

const FALLBACK_BANNERS = [
    {
        title: 'Summer escapes flat 30% off.',
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        subtext: 'Explore Secret Deals',
        type: 'Limited Offer'
    },
    {
        title: 'Monsoon retreats in style.',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        subtext: 'View Packages',
        type: 'New Season'
    }
];

const HeroBanner = () => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await api.get('/media/banner');
                const activeOnly = data.filter(banner => banner.isActive !== false);
                setBanners(activeOnly.length > 0 ? activeOnly : FALLBACK_BANNERS);
            } catch (error) {
                console.error('Banner fetch error:', error);
                setBanners(FALLBACK_BANNERS);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [banners]);

    if (loading) return (
        <div className="h-56 bg-secondary animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <section className="pt-0 overflow-hidden">
            <div className="relative h-56 bg-secondary shadow-lg">
                {banners.map((slide, index) => (
                    <div
                        key={index}
                        onClick={() => navigate('/rooms')}
                        className={`absolute inset-0 cursor-pointer transition-all duration-[1.5s] ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
                    >
                        <img
                            src={slide.imageUrl}
                            className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.5]"
                            alt={slide.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/40 to-transparent"></div>
                        <div className="absolute inset-y-0 left-0 w-full p-6 flex flex-col justify-center space-y-1.5 z-10">
                            <div className="inline-block bg-primary/20 backdrop-blur-sm text-primary text-[6px] font-bold px-1.5 py-0.5 rounded-[2px] w-fit uppercase tracking-widest border border-primary/20">{slide.type || 'Ananya'}</div>
                            <h2 className="text-white font-serif text-lg leading-tight lowercase max-w-[200px]">
                                {slide.title.split(' ').map((word, i) => (
                                    i % 2 !== 0 ? <span key={i} className="text-primary italic"> {word} </span> : word + ' '
                                ))}
                            </h2>
                            <button className="text-[8px] font-bold text-white/50 uppercase tracking-[0.2em] flex items-center group/btn w-fit pt-1">
                                {slide.subtext || 'Discover more'} <ChevronRight size={10} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="absolute bottom-4 left-6 flex space-x-1.5 z-20">
                    {banners.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-4 bg-primary' : 'w-1 bg-white/30'}`}></div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;
