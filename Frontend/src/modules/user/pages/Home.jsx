import React from 'react';
import HomeHeader from '../components/home/HomeHeader';
import HeroBanner from '../components/home/HeroBanner';
import CategorySelector from '../components/home/CategorySelector';
import QuickNav from '../components/home/QuickNav';
import InterstitialBanner from '../components/home/InterstitialBanner';
import FeaturedStays from '../components/home/FeaturedStays';
import GuestFeedback from '../components/home/GuestFeedback';
import SupportGrid from '../components/home/SupportGrid';
import FeedbackModule from '../components/home/FeedbackModule';
import RecentActivity from '../components/home/RecentActivity';
import { api as hotelApi } from '../../../services/api';
import { Coffee } from 'lucide-react';

const Home = () => {
    const [dineItems, setDineItems] = React.useState([]);
    const [loadingDine, setLoadingDine] = React.useState(true);

    React.useEffect(() => {
        const fetchDine = async () => {
            try {
                const { data } = await hotelApi.get('/services/dine');
                setDineItems(data.slice(0, 6)); // Just show top 6
            } catch (error) {
                console.error('Error fetching dine:', error);
            } finally {
                setLoadingDine(false);
            }
        };
        fetchDine();
    }, []);

    return (
        <div className="bg-[#F8F9FA] min-h-screen pb-24 md:pb-0 relative select-none">
            {/* Subtle Texture for App Background */}
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>

            <HomeHeader />

            <HeroBanner />

            <CategorySelector />

            <QuickNav />

            {/* Sub module: Dine Highlights */}
            {(loadingDine || dineItems.length > 0) && (
                <section className="py-8 pl-4 lg:pl-10">
                    <div className="flex justify-between items-end pr-4 lg:pr-10 mb-6">
                        <div>
                            <h2 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tighter">Signature <span className="text-primary italic">Gastronomy</span></h2>
                            <p className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Epicurean delights by the coast</p>
                        </div>
                        <button onClick={() => window.location.href = '/dine'} className="text-[9px] font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-0.5">Explore Menu</button>
                    </div>

                    <div className="flex overflow-x-auto gap-4 pr-4 no-scrollbar">
                        {loadingDine ? (
                            [1, 2, 3].map(i => <div key={i} className="min-w-[200px] h-32 bg-slate-100 rounded-3xl animate-pulse" />)
                        ) : (
                            dineItems.map((item) => (
                                <div key={item._id} className="min-w-[240px] group relative rounded-[2rem] overflow-hidden bg-white shadow-sm border border-slate-100/50">
                                    <div className="h-40 overflow-hidden">
                                        <img
                                            src={item.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={item.name}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[7px] font-black text-primary uppercase tracking-widest mb-1">{item.category}</p>
                                        <h3 className="text-xs font-black text-secondary uppercase tracking-tight truncate">{item.name}</h3>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-secondary">₹{item.price}</span>
                                            <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-secondary transition-all">
                                                <Coffee size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* Interstitial: Dining */}
            <InterstitialBanner
                tag="Chef's Special"
                title="Coastal"
                italicTitle="Spirits & Culinary Art"
                subtext="Book a table at our signature waterfront restaurant."
                btnText="Reserve Now"
                img="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80"
                path="/contact"
            />

            <FeaturedStays />

            {/* Interstitial: Events */}
            <InterstitialBanner
                tag="Unforgettable moments"
                title="Grand"
                italicTitle="Ballrooms & Galas"
                subtext="Host your dream wedding or corporate milestone in our elite venues."
                btnText="Request Quote"
                img="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"
                path="/contact"
                type="vertical"
            />

            <GuestFeedback />

            <SupportGrid />

            <FeedbackModule />

            <RecentActivity />
        </div>
    );
};

export default Home;

