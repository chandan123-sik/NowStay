import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNavbar from './BottomNavbar';
import { RefreshCcw, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const isBlocked = user?.status === 'blocked';
    const [touchStart, setTouchStart] = useState(null);
    const [pullDistance, setPullDistance] = React.useState(0);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    React.useEffect(() => {
        const handleTouchStart = (e) => {
            if (window.scrollY === 0) {
                setTouchStart(e.touches[0].clientY);
            }
        };

        const handleTouchMove = (e) => {
            if (touchStart === null || window.scrollY > 0) return;

            const currentTouch = e.touches[0].clientY;
            const distance = currentTouch - touchStart;

            if (distance > 0) {
                // Apply resistance to the pull
                const resistedDistance = Math.min(distance * 0.4, 80);
                setPullDistance(resistedDistance);

                // Prevent default scrolling when pulling down at top
                if (distance > 10 && e.cancelable) {
                    e.preventDefault();
                }
            }
        };

        const handleTouchEnd = () => {
            if (pullDistance > 60) {
                setIsRefreshing(true);
                window.location.reload();
            }
            setTouchStart(null);
            setPullDistance(0);
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [touchStart, pullDistance]);

    if (isBlocked) {
        // ... (existing blocked logic)
        return (
            <div className="fixed inset-0 z-[9999] bg-secondary flex flex-col items-center justify-center p-8 text-center">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse pointer-events-none"></div>
                <div className="relative mb-10">
                    <div className="w-24 h-24 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/20 animate-bounce shadow-2xl shadow-rose-500/20">
                        <ShieldAlert size={48} className="text-rose-500" />
                    </div>
                </div>
                <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px] mb-2">Sanctuary Access Revoked</span>
                <h1 className="text-3xl font-serif text-white mb-4 lowercase">Access Restricted.</h1>
                <div className="max-w-xs bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl mb-10">
                    <p className="text-white/60 text-xs font-medium leading-relaxed italic">
                        "We regret to inform you that your profile has been restricted by the administration. You can no longer access guest services or private modules at this time."
                    </p>
                </div>
                <div className="flex flex-col gap-4 w-full max-w-[240px]">
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 text-white/40 hover:text-white text-[9px] font-bold uppercase tracking-widest py-2 transition-colors group"
                    >
                        <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" />
                        Log out of session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Pull to Refresh Indicator */}
            <div
                className="fixed top-0 left-0 w-full flex justify-center z-[100] transition-transform duration-200 pointer-events-none"
                style={{ transform: `translateY(${pullDistance - 40}px)`, opacity: pullDistance / 60 }}
            >
                <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
                    <RefreshCcw size={12} className={`text-primary ${pullDistance > 55 ? 'animate-spin' : ''}`} />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-secondary">
                        {pullDistance > 55 ? 'Release to Refresh' : 'Pull to Refresh'}
                    </span>
                </div>
            </div>

            <Navbar />
            <main className="flex-grow pb-16 md:pb-0">
                <Outlet />
            </main>
            <BottomNavbar />

            {/* MINIMAL REFRESH BUTTON: Quick manual sync trigger */}
            <button
                onClick={() => window.location.reload()}
                className="fixed bottom-24 right-4 z-40 p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90 md:bottom-10 md:right-10 group"
                title="Sync Application"
            >
                <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            </button>
        </div>
    );
};

export default UserLayout;
