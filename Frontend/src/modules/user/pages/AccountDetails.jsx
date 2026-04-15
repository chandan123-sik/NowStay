import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Camera, ChevronLeft, Shield, CheckCircle2, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

import api from '../../../services/api';

const Field = ({ icon: Icon, label, value, editing, field, formData, onChange, verified, disabled }) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Icon size={10} className="text-primary" /> {label}
        </label>
        {editing && !disabled ? (
            <input
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3 rounded-xl outline-none transition-all font-medium text-secondary"
                value={formData[field]}
                onChange={e => onChange(field, e.target.value)}
                maxLength={field === 'mobile' ? 10 : undefined}
                placeholder={field === 'mobile' ? '10-digit number' : ''}
            />
        ) : (
            <div className="flex items-center justify-between">
                <p className={`font-bold text-sm ${disabled ? 'text-secondary/50' : 'text-secondary'}`}>{value || formData[field]}</p>
                {verified && (
                    <span className="flex items-center gap-1 text-emerald-600 text-[9px] font-black">
                        <CheckCircle2 size={11} /> Verified
                    </span>
                )}
            </div>
        )}
    </div>
);

const AccountDetails = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
        city: user?.city || '',
        country: user?.country || '',
    });

    if (!user) { navigate('/login'); return null; }

    const handleChange = (field, value) => {
        if (field === 'mobile') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [field]: numericValue }));
            return;
        }
        if (field === 'name' || field === 'city' || field === 'country') {
            const alphaValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({ ...prev, [field]: alphaValue }));
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Flutter Bridge for Native Camera/Gallery Integration
    useEffect(() => {
        window.setProfileImage = async (imageUrl) => {
            if (!imageUrl) return;
            setUploading(true);
            try {
                const updatedUserRes = await api.put(`/users/${user._id}`, { profilePicture: imageUrl });
                updateProfile(updatedUserRes.data);
                toast.success('Visual identity synchronized!');
            } catch (error) {
                console.error('Flutter bridge error:', error);
                toast.error('Identity sync failed');
            } finally {
                setUploading(false);
            }
        };
        return () => { delete window.setProfileImage; };
    }, [user._id, updateProfile]);

    const handleCameraClick = () => {
        if (!isEditing) return;

        // Bridge for Flutter WebView
        if (window.FlutterImagePicker) {
            window.FlutterImagePicker.postMessage('pickImage');
        } else {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await api.post('/media/upload-single', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = res.data.imageUrl;

            // Update profile with new image URL
            const updatedUserRes = await api.put(`/users/${user._id}`, { profilePicture: imageUrl });
            updateProfile(updatedUserRes.data);
            toast.success('Visual identity updated!');
        } catch (error) {
            console.error(error);
            toast.error('Identity photo mismatch');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (formData.mobile.length !== 10) return alert("Mobile number must be exactly 10 digits");
        setLoading(true);
        try {
            const { data } = await api.put(`/users/${user._id}`, {
                name: formData.name,
                mobile: formData.mobile,
                city: formData.city,
                country: formData.country
            });

            // Sync with Context / LocalStorage
            updateProfile(data);

            setSaved(true);
            setIsEditing(false);
            setTimeout(() => setSaved(false), 2500);
        } catch (error) {
            alert(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-6 md:pb-10">
            {/* Hidden Input for Camera */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Header */}
            <div className="bg-white border-b border-slate-100 shadow-sm px-4 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/')}
                    className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-secondary active:scale-90 transition-all">
                    <ChevronLeft size={18} />
                </button>
                <div>
                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Settings</p>
                    <h1 className="text-sm font-bold text-secondary">Account Details</h1>
                </div>
                <div className="ml-auto">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(false)}
                                className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors active:scale-90">
                                <X size={16} />
                            </button>
                            <button onClick={handleSave} disabled={loading}
                                className={`flex items-center gap-1.5 bg-primary text-secondary px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-90 transition-all ${loading ? 'opacity-50' : ''}`}>
                                <Save size={13} /> {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)}
                            className="bg-secondary text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-90 transition-all shadow-sm">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {saved && (
                <div className="mx-4 mt-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={14} /> Profile updated successfully!
                </div>
            )}

            <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">

                {/* Personal Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                    {/* Visual Identity (Avatar) */}
                    <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-50">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-primary/10 border-4 border-white shadow-xl rounded-[2rem] flex items-center justify-center text-primary font-serif text-3xl font-bold overflow-hidden ring-4 ring-primary/5">
                                {uploading ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="animate-spin" size={24} />
                                        <span className="text-[7px] font-black uppercase mt-1">Syncing...</span>
                                    </div>
                                ) : user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name[0]
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    onClick={handleCameraClick}
                                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-secondary rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-90 border-4 border-white"
                                >
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-4">Visual Clearance Protocol</p>
                    </div>

                    <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
                        Personal Information
                    </h2>
                    <Field icon={User} label="Full Name" field="name" formData={formData} editing={isEditing} onChange={handleChange} />
                    <Field icon={Mail} label="Email Address" field="email" value={user.email} formData={formData} editing={isEditing} onChange={handleChange} verified disabled />
                    <Field icon={Phone} label="Phone Number" field="mobile" formData={formData} editing={isEditing} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <Field icon={MapPin} label="City" field="city" formData={formData} editing={isEditing} onChange={handleChange} />
                        <Field icon={MapPin} label="Country" field="country" formData={formData} editing={isEditing} onChange={handleChange} />
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
                        Preferences
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-secondary font-bold text-sm">Notifications</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">WhatsApp & Email updates</p>
                        </div>
                        <button onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${notifications ? 'bg-primary' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${notifications ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Privacy notice */}
                <div className="bg-secondary/5 border border-primary/10 rounded-2xl p-5 flex gap-3">
                    <Shield size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Privacy & Security</p>
                        <p className="text-slate-500 text-xs leading-relaxed">Your data is encrypted and managed under our premium hospitality privacy standards. We never share your stay details with third parties.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDetails;

