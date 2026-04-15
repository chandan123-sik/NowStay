import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, ChevronLeft, Shield, CheckCircle2, Save, X, Lock, Key } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

const Field = ({ icon: Icon, label, value, editing, field, formData, onChange, verified, disabled, type = "text" }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Icon size={12} className="text-primary" /> {label}
        </label>
        {editing && !disabled ? (
            <input
                type={type}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-5 py-3.5 rounded-2xl outline-none transition-all font-bold text-secondary placeholder:text-slate-300"
                value={formData[field]}
                onChange={e => onChange(field, e.target.value)}
                maxLength={field === 'mobile' ? 10 : undefined}
                placeholder={`Enter your ${label.toLowerCase()}`}
            />
        ) : (
            <div className="flex items-center justify-between bg-white border border-slate-100 px-5 py-3.5 rounded-2xl shadow-sm">
                <p className={`font-bold text-sm ${disabled ? 'text-secondary/40' : 'text-secondary'}`}>
                    {type === "password" ? "••••••••" : (value || formData[field] || "Not provided")}
                </p>
                {verified && (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Verified
                    </span>
                )}
            </div>
        )}
    </div>
);

const AdminProfile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
        city: user?.city || '',
        country: user?.country || '',
        oldPassword: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || '',
                city: user.city || '',
                country: user.country || '',
            }));
        }
    }, [user]);

    if (!user) { navigate('/admin/login'); return null; }

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Validation
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        const updateData = {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            city: formData.city,
            country: formData.country
        };

        if (formData.password) {
            updateData.oldPassword = formData.oldPassword;
            updateData.password = formData.password;
        }

        try {
            const { data } = await api.put(`/users/${user._id}`, updateData);

            // Sync with Context / LocalStorage
            updateProfile(data);

            toast.success("Identity updated successfully", {
                icon: '🛡️',
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            });

            setIsEditing(false);
            setFormData(prev => ({ ...prev, oldPassword: '', password: '', confirmPassword: '' }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update protocol failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Administrative Profile</span>
                    </div>
                    <h1 className="text-4xl font-black text-secondary lowercase tracking-tighter">
                        Manage <span className="text-primary italic">Identity</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Configure your administrative access and personal metadata.</p>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                            >
                                <X size={14} /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 bg-secondary text-primary px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-all active:scale-95 shadow-xl shadow-primary/20"
                            >
                                <Save size={14} /> {loading ? 'Processing...' : 'Save Protocols'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-secondary text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-secondary/10"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Security Status */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />

                        <div className="relative group mb-6">
                            <div className="w-32 h-32 bg-secondary text-primary rounded-[2.5rem] shadow-2xl flex items-center justify-center font-black text-4xl border-4 border-white/10 overflow-hidden ring-4 ring-primary/5">
                                {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" alt="" /> : user.name?.[0] || 'A'}
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-secondary rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-90 border-4 border-white">
                                <Camera size={16} />
                            </button>
                        </div>

                        <h2 className="text-xl font-black text-secondary lowercase tracking-tight mb-1">{formData.name}</h2>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-100">
                            <Shield size={10} className="fill-emerald-600/10" /> Super Admin
                        </span>

                        <div className="w-full mt-8 pt-8 border-t border-slate-50 space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Node ID</span>
                                <span className="text-[10px] font-mono font-bold text-secondary">{user._id?.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Status</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Active
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
                        <Key size={24} className="text-primary mb-4" />
                        <h3 className="text-lg font-black tracking-tight mb-2 italic">Security Protocol</h3>
                        <p className="text-white/50 text-[11px] leading-relaxed font-medium uppercase tracking-[0.05em]">
                            You are authenticated via Level 1 administrative clearance. All profile modifications are encrypted and logged in the system ledger.
                        </p>
                    </div>
                </div>

                {/* Right Column: Information & Password Management */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Information Grid */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-secondary uppercase tracking-widest leading-none mb-1">Administrative Data</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Personal identification fields</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <Field icon={User} label="Full Name" field="name" formData={formData} editing={isEditing} onChange={handleChange} />
                            <Field icon={Mail} label="Email Address" field="email" formData={formData} editing={isEditing} onChange={handleChange} verified />
                            <Field icon={Phone} label="Phone Number" field="mobile" formData={formData} editing={isEditing} onChange={handleChange} />
                            <Field icon={MapPin} label="Base Location" field="city" formData={formData} editing={isEditing} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Password Management */}
                    <div className={`bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 transition-all duration-500 ${isEditing ? 'opacity-100' : 'opacity-60'}`}>
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-secondary uppercase tracking-widest leading-none mb-1">Pass-Key Management</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Update your administrative credentials</p>
                            </div>
                        </div>

                        {!isEditing ? (
                            <div className="flex items-center justify-between bg-slate-50/50 px-6 py-5 rounded-2xl border border-dashed border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300">
                                        <Lock size={14} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Encrypted Credentials Restricted</p>
                                </div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Enter Edit Mode</span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <Field icon={Key} label="Current Password" field="oldPassword" formData={formData} editing={true} onChange={handleChange} type="password" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <Field icon={Key} label="New Password" field="password" formData={formData} editing={true} onChange={handleChange} type="password" />
                                    <Field icon={Shield} label="Confirm Password" field="confirmPassword" formData={formData} editing={true} onChange={handleChange} type="password" />
                                </div>
                            </div>
                        )}

                        {isEditing && (
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                                <Shield size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-[9px] font-bold text-amber-700 uppercase tracking-[0.05em] leading-relaxed">
                                    Changing your password will take immediate effect. Ensure you use a high-entropy passphrase for maximum security.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
