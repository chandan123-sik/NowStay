import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { roomCategories } from '../../../../utils/roomData';
import { useAuth } from '../../../../context/AuthContext';

const FeaturedStays = () => {
    const navigate = useNavigate();
    const { user, wishlist, toggleWishlist } = useAuth();
    const isBlocked = user?.status === 'blocked';

    const handleToggleLike = (e, index) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Log in to save favorites');
            return;
        }

        const isAdding = !wishlist.includes(index);
        toggleWishlist(index);

        toast.success(isAdding ? 'Added to your wishlist' : 'Removed from your wishlist', {
            style: { background: '#1e293b', color: '#fff', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' },
            icon: isAdding ? '❤️' : '💔'
        });
    };

    const handleShare = (room) => {
        const shareData = {
            title: `NowStay - ${room.type}`,
            text: `Check out this amazing ${room.type} at NowStay!`,
            url: window.location.origin + '/rooms'
        };

        if (navigator.share) {
            navigator.share(shareData).catch(() => { });
        } else {
            navigator.clipboard.writeText(shareData.url);
            toast.success('Link copied to clipboard');
        }
    };

    return (
        <section className="py-6 bg-white border-b border-slate-100">
            <div className="px-4 flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary border-l-2 border-primary pl-3">Curated Stays</h3>
                <button
                    onClick={() => navigate('/rooms')}
                    className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                >
                    View All
                </button>
            </div>
            <div className="flex overflow-x-auto px-4 pb-4 space-x-3 no-scrollbar snap-x">
                {roomCategories.map((room, i) => (
                    <div
                        key={i}
                        onClick={() => !isBlocked && navigate('/rooms', { state: { initialSearch: room.type } })}
                        className={`flex-shrink-0 w-[75vw] bg-white rounded-xl border border-slate-100 shadow-md overflow-hidden snap-center group transition-all
                            ${isBlocked ? 'opacity-70 cursor-not-allowed grayscale-[0.3]' : 'active:scale-95 cursor-pointer'}`}
                    >
                        <div className="relative h-40 overflow-hidden">
                            <img src={room.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={room.type} />

                            {/* Action Cluster */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                <button
                                    onClick={(e) => handleToggleLike(e, i)}
                                    className={`p-2 backdrop-blur-md rounded-lg transition-all active:scale-90 shadow-lg ${wishlist.includes(i) ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white hover:text-primary'}`}
                                >
                                    <Heart size={14} fill={wishlist.includes(i) ? "currentColor" : "none"} className={wishlist.includes(i) ? "animate-pulse" : ""} />
                                </button>
                                {navigator.share && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleShare(room); }}
                                        className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-primary transition-all active:scale-90 shadow-lg"
                                    >
                                        <Share2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
                                <span className="bg-primary px-2 py-0.5 text-[7px] font-bold text-white uppercase tracking-widest rounded-md">Luxury</span>
                                <div className="bg-secondary/80 backdrop-blur-md px-2 py-0.5 flex items-center space-x-1 rounded-md">
                                    <Star size={8} className="text-accent" fill="currentColor" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">4.9 (120)</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            <h4 className="text-sm font-bold text-secondary truncate uppercase tracking-tight">{room.type}</h4>
                            <div className="flex items-center justify-between">
                                <p className="text-primary font-bold text-lg">₹{room.price}<span className="text-[8px] text-slate-400 font-normal uppercase ml-1">/ Night</span></p>
                                {!isBlocked ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate('/rooms', { state: { initialSearch: room.type } }); }}
                                        className="bg-secondary text-white text-[8px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest active:scale-90 transition-all shadow-sm"
                                    >
                                        Book
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                        <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest">Restricted</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedStays;
