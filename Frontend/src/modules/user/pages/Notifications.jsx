import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import {
    Bell, CheckCircle2, CreditCard, Ticket, AlertCircle,
    Trash2, Check, Clock, ChevronRight, Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { user, fetchUnreadCount } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get(`/notifications/my/${user._id}`);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user?._id]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            fetchUnreadCount();
        } catch (e) { console.error(e); }
    };

    const markAllRead = async () => {
        try {
            await api.patch(`/notifications/read-all/${user._id}`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            fetchUnreadCount();
        } catch (e) { console.error(e); }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (e) { console.error(e); }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <Ticket size={18} className="text-purple-500" />;
            case 'wallet': return <CreditCard size={18} className="text-emerald-500" />;
            case 'offer': return <CheckCircle2 size={18} className="text-amber-500" />;
            case 'system': return <Bell size={18} className="text-blue-500" />;
            default: return <AlertCircle size={18} className="text-slate-400" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Elegant Header */}
            <div className="relative bg-secondary pt-16 pb-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, #c9a84c 0%, transparent 40%), radial-gradient(circle at 90% 10%, #c9a84c 0%, transparent 40%)' }} />
                <div className="relative z-10 px-6 text-center">
                    <div className="w-12 h-12 bg-primary/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 relative">
                        <Bell size={24} className="text-primary" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-secondary animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.6em]">Communications</span>
                    <h1 className="text-3xl lg:text-5xl font-serif text-white mt-4 lowercase leading-tight capitalize">
                        Stay <span className="text-primary italic">Notified.</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full" />
                            <h2 className="text-secondary font-black text-xs uppercase tracking-widest">Inbox Transmissions</h2>
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                                <Check size={12} /> Mark all read
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="p-20 text-center animate-pulse">
                            <Clock size={40} className="mx-auto text-slate-100 mb-4" />
                            <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.3em]">Decoding Frequencies...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <Inbox size={32} />
                            </div>
                            <h3 className="text-secondary font-serif text-xl lowercase">Static silence.</h3>
                            <p className="text-slate-400 text-xs mt-2 max-w-[240px] mx-auto font-medium">No alerts have reached your sanctuary yet. Stay tuned for updates.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {notifications.map((notif) => (
                                <div key={notif._id}
                                    className={`p-6 transition-all duration-300 group ${notif.isRead ? 'opacity-60 bg-white' : 'bg-slate-50/50 hover:bg-slate-50'}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0 transition-transform group-hover:scale-110 ${notif.isRead ? 'bg-slate-50 border-slate-100' : 'bg-white border-primary/20'}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-grow space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-xs font-black uppercase tracking-tight ${notif.isRead ? 'text-slate-500' : 'text-secondary'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex gap-4">
                                                    {!notif.isRead && (
                                                        <button onClick={() => markAsRead(notif._id)} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline decoration-primary/30">Read</button>
                                                    )}
                                                    <button onClick={() => deleteNotification(notif._id)} className="text-[9px] font-black text-rose-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-600 flex items-center gap-1">
                                                        <Trash2 size={10} /> Delete
                                                    </button>
                                                </div>
                                                {notif.link && (
                                                    <button onClick={() => navigate(notif.link)} className="text-[9px] font-black text-secondary uppercase tracking-widest flex items-center gap-1 group/btn">
                                                        Go to Resource <ChevronRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <button onClick={() => navigate(-1)} className="px-10 py-4 bg-white border border-slate-100 text-secondary rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-slate-200/50">
                        Exit Frequency
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
