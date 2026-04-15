import { useState, useEffect } from 'react';
import { Mail, User, Phone, Calendar, Trash2, CheckCircle2, MessageSquare, Search, Filter, X, Eye } from 'lucide-react';
import api from '../../../services/api';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/messages');
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/messages/${id}/status`, { status });
            fetchMessages();
            if (selectedMessage?._id === id) {
                setSelectedMessage(prev => ({ ...prev, status }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await api.delete(`/messages/${id}`);
            fetchMessages();
            if (selectedMessage?._id === id) setSelectedMessage(null);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const filteredMessages = messages.filter(msg => {
        const cleanSearchTerm = searchTerm.replace(/\s/g, '').toLowerCase();
        const matchesSearch =
            `${msg.firstName || ''}${msg.lastName || ''}`.toLowerCase().replace(/\s/g, '').includes(cleanSearchTerm) ||
            (msg.firstName || '').toLowerCase().replace(/\s/g, '').includes(cleanSearchTerm) ||
            (msg.lastName || '').toLowerCase().replace(/\s/g, '').includes(cleanSearchTerm) ||
            (msg.email || '').toLowerCase().replace(/\s/g, '').includes(cleanSearchTerm) ||
            (msg.subject || '').toLowerCase().replace(/\s/g, '').includes(cleanSearchTerm);

        const matchesFilter = filterStatus === 'all' || msg.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500 text-left pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Guest <span className="text-primary italic">Feedback</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight mt-1">Manage inquiries and feedback from the contact vault.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto">
                    <div className="relative flex-grow sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder="Search correspondence..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-50 border-none rounded-xl py-2 px-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Message List */}
                <div className="xl:col-span-2 space-y-4">
                    {filteredMessages.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                            <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No transmissions detected.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredMessages.map(msg => (
                                <div
                                    key={msg._id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`group cursor-pointer bg-white p-5 lg:p-7 rounded-[1.5rem] lg:rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden
                                        ${selectedMessage?._id === msg._id ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-slate-100 hover:border-primary/30 shadow-sm hover:shadow-md'}`}
                                >
                                    {msg.status === 'new' && (
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform" />
                                    )}

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                                <User size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm lg:text-base font-black text-secondary leading-none flex items-center gap-2">
                                                    {msg.firstName} {msg.lastName}
                                                    {msg.status === 'new' && <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                                                </h3>
                                                <p className="text-[10px] lg:text-xs text-slate-400 font-medium mt-1 truncate">{msg.email}</p>
                                                <div className="mt-3 inline-block px-3 py-1 bg-secondary text-primary rounded-lg text-[8px] font-black uppercase tracking-[0.2em]">
                                                    {msg.subject}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[9px] text-slate-300 font-bold uppercase">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest
                                                ${msg.status === 'new' ? 'bg-primary/20 text-primary' : msg.status === 'read' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {msg.status}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-5 text-xs lg:text-sm text-slate-500 line-clamp-2 leading-relaxed italic opacity-80 pl-2 border-l-2 border-slate-100">
                                        "{msg.message}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message Detail / Sidebar */}
                <div className="xl:col-span-1">
                    {selectedMessage ? (
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-secondary p-8 lg:p-10 rounded-[2rem] lg:rounded-[3rem] text-white relative overflow-hidden group border border-white/5 animate-in slide-in-from-right-4 duration-500">
                                <div className="absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                                <div className="flex flex-col items-center text-center relative z-10 mb-10">
                                    <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 mb-4">
                                        <User size={32} className="text-primary" />
                                    </div>
                                    <h2 className="text-xl lg:text-2xl font-serif italic">{selectedMessage.firstName} {selectedMessage.lastName}</h2>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1">Inquiry Identity</p>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center gap-4 text-xs font-medium text-white/60">
                                        <div className="p-2.5 bg-white/5 rounded-xl"><Mail size={16} className="text-primary" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Electronic Address</p>
                                            <p className="truncate text-white font-bold">{selectedMessage.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-medium text-white/60">
                                        <div className="p-2.5 bg-white/5 rounded-xl"><Phone size={16} className="text-primary" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Mobile Protocol</p>
                                            <p className="truncate text-white font-bold">{selectedMessage.phone || 'Not Specified'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-medium text-white/60">
                                        <div className="p-2.5 bg-white/5 rounded-xl"><Calendar size={16} className="text-primary" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Temporal Stamp</p>
                                            <p className="truncate text-white font-bold">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-xl relative animate-in slide-in-from-bottom-4 duration-500 delay-150">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><MessageSquare size={18} /></div>
                                    <h3 className="font-black text-secondary lowercase capitalize tracking-tight text-sm lg:text-base">Message <span className="text-primary italic">Narrative</span></h3>
                                </div>
                                <div className="p-5 lg:p-7 bg-slate-50/50 rounded-2xl lg:rounded-[2rem] border border-slate-100 text-xs lg:text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                                    "{selectedMessage.message}"
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-8">
                                    {selectedMessage.status === 'new' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedMessage._id, 'read')}
                                            className="col-span-2 py-4 bg-primary text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={14} /> Mark as Processed
                                        </button>
                                    )}
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                        className="py-3.5 bg-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Mail size={12} /> Reply Email
                                    </a>
                                    <button
                                        onClick={() => handleDelete(selectedMessage._id)}
                                        className="py-3.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="sticky top-24 bg-primary/5 rounded-[2.5rem] p-10 border-2 border-dashed border-primary/20 flex flex-col items-center text-center">
                            <Eye size={40} className="text-primary mb-6 animate-bounce" />
                            <h4 className="text-secondary font-black text-xs lg:text-sm mb-2 tracking-widest uppercase">Intellectual Viewport</h4>
                            <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">Select a correspondence transmission from the ledger to view detailed analytics and operational responses.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* User detail section if linked to a user */}
            {selectedMessage?.user && (
                <div className="mt-10 bg-white p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-sm animate-in fade-in duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100"><User size={24} /></div>
                        <div>
                            <h3 className="font-black text-secondary lowercase capitalize tracking-tight text-lg">Linked Guest <span className="text-emerald-600 italic">Profile</span></h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Authenticated system identity.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-dotted border-slate-200">
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Account Holder</p>
                            <p className="text-xs font-bold text-secondary">{selectedMessage.user.name}</p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-dotted border-slate-200">
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Electronic Credential</p>
                            <p className="text-xs font-bold text-secondary">{selectedMessage.user.email}</p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-dotted border-slate-200">
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Mobile Terminal</p>
                            <p className="text-xs font-bold text-secondary">{selectedMessage.user.mobile || '—'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
