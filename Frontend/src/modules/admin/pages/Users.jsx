import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Search, Filter, Shield, Download, Phone, Mail, Calendar, MapPin, UserCheck, UserX } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);



    const toggleStatus = async (user) => {
        try {
            const newStatus = user.status === 'active' ? 'blocked' : 'active';
            await api.put(`/users/${user._id}`, { status: newStatus });
            fetchUsers();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const filtered = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'All' || (u.role || '').toLowerCase() === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    const downloadCSV = () => {
        const headers = ["Name", "Email", "Mobile", "Role", "City", "Country", "Wallet", "Verified", "Status", "Joined"];
        const rows = filtered.map(u => [
            u.name, u.email, `'${u.mobile || ''}`, u.role.toUpperCase(), u.city, u.country, u.walletBalance, u.isVerified, u.status, new Date(u.createdAt).toLocaleDateString()
        ]);

        const csvContent = "\uFEFF" + headers.join(",") + "\n"
            + rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `NowStay_Users_Registry_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link); link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 text-left pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <label className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1 block">Account Management</label>
                    <h1 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tighter leading-none">Users <span className="text-emerald-600 italic">Registry</span></h1>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">

                    <button
                        onClick={downloadCSV}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </header>



            <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 uppercase transition-all shadow-sm"
                        />
                    </div>
                    <div className="w-full md:w-auto flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                        <Filter size={14} className="text-slate-400 shrink-0" />
                        <select
                            className="w-full bg-transparent text-xs font-bold uppercase tracking-widest outline-none cursor-pointer"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option>All Roles</option>
                            <option value="admin">Admins</option>
                            <option value="user">Users</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar table-responsive-container">
                    <table className="w-full min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[9px] uppercase font-black tracking-[0.15em] text-slate-500 border-b border-slate-200">
                                <th className="px-6 py-5 text-left sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Veritas</th>
                                <th className="px-6 py-5 text-left">Identity</th>
                                <th className="px-6 py-5 text-left">Contact</th>
                                <th className="px-6 py-5 text-left">Presence</th>
                                <th className="px-6 py-5 text-center">Role</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Identity not found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50/50 transition-all text-xs border-b border-slate-50 last:border-0">
                                        <td className="px-6 py-5 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                                            {u.isVerified ?
                                                <UserCheck size={18} className="text-emerald-500" /> :
                                                <UserX size={18} className="text-rose-400" />
                                            }
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                                                    {u.profilePicture ? (
                                                        <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        u.name[0]
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-secondary uppercase tracking-tight leading-none mb-1 truncate">{u.name}</p>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Mail size={10} className="text-primary" />
                                                        <span className="text-[9px] font-bold truncate">{u.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-secondary font-bold">
                                                <Phone size={10} className="text-primary" />
                                                <span>{u.mobile || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-secondary font-bold uppercase tracking-tight">
                                                <MapPin size={10} className="text-primary" />
                                                <span className="truncate">{u.city || 'N/A'}, {u.country || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-sm text-[7px] font-bold uppercase tracking-widest border ${u.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-sm text-[7px] font-bold uppercase tracking-widest border ${u.status === 'blocked' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                {u.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleStatus(u)}
                                                className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-sm border transition-all ${u.status === 'blocked' ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                                    }`}
                                            >
                                                {u.status === 'blocked' ? 'Unblock' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
