import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import {
    Mail, Lock, UserPlus, User, Eye, EyeOff, Sparkles, Phone,
    Globe, MapPin, Image as ImageIcon, Languages, Ticket,
    ShieldCheck, ChevronRight, ChevronLeft, CheckCircle2
} from 'lucide-react';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', mobile: '',
        password: '', confirmPassword: '',
        country: '', city: '',
        profilePicture: '', preferredLanguage: 'English', referralCode: '',
        termsAccepted: false
    });
    const [otp, setOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [picLoading, setPicLoading] = useState(false);
    const { signup, user, verifyOtp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/');

        // Restore progress on mount
        const savedProgress = sessionStorage.getItem('signup_progress');
        if (savedProgress) {
            const { step: savedStep, formData: savedData } = JSON.parse(savedProgress);
            setStep(savedStep);
            setFormData(savedData);
        }
    }, [user, navigate]);

    // Persist progress on change
    useEffect(() => {
        if (step > 1 || formData.name) { // only store if user started filling
            sessionStorage.setItem('signup_progress', JSON.stringify({ step, formData }));
        }
    }, [step, formData]);

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Numeric validation for mobile field
        if (name === 'mobile') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
            return;
        }

        // Name validation for name field (alphabets and spaces only)
        if (name === 'name' || name === 'city' || name === 'country') {
            const alphaValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: alphaValue
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateStep = (s) => {
        const toastCfg = {
            style: {
                borderRadius: '16px',
                background: '#1e293b',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: '1px solid rgba(20, 184, 166, 0.2)'
            },
            iconTheme: {
                primary: '#14b8a6',
                secondary: '#fff',
            },
        };

        if (s === 1) {
            if (!formData.name.trim()) { toast.error("Please enter your full name", toastCfg); return false; }

            // Email is now optional, but if provided, must be valid
            if (formData.email.trim()) {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(formData.email)) {
                    toast.error("Please enter a valid email address", toastCfg);
                    return false;
                }
            }

            // Mobile number is mandatory (especially if email is missing)
            if (formData.mobile.length !== 10) {
                toast.error("Mobile number is required (10 digits)", toastCfg);
                return false;
            }
        }
        if (s === 2) {
            if (!formData.password) { toast.error("Please set a security password", toastCfg); return false; }
            if (formData.password.length < 6) { toast.error("Password must be at least 6 characters", toastCfg); return false; }
            if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match", toastCfg); return false; }
        }
        if (s === 3) {
            if (!formData.country.trim()) { toast.error("Please specify your country", toastCfg); return false; }
            if (!formData.city.trim()) { toast.error("Please specify your city", toastCfg); return false; }
        }
        return true;
    };

    const nextStep = async () => {
        if (validateStep(step)) {
            if (step === 1) {
                setLoading(true);
                try {
                    const { data } = await api.post('/auth/check-availability', {
                        email: formData.email,
                        mobile: formData.mobile
                    });
                    if (!data.available) {
                        toast.error(data.message, {
                            style: {
                                borderRadius: '16px',
                                background: '#1e293b',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                border: '1px solid rgba(20, 184, 166, 0.2)'
                            }
                        });
                        return;
                    }
                } catch (err) {
                    console.error("Availability check failed:", err);
                } finally {
                    setLoading(false);
                }
            }
            setStep(s => s + 1);
        }
    };

    const prevStep = () => setStep(s => s - 1);

    const handleRegister = async (e) => {
        e.preventDefault();
        const toastCfg = {
            style: {
                borderRadius: '16px',
                background: '#1e293b',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: '1px solid rgba(20, 184, 166, 0.2)'
            },
            iconTheme: { primary: '#14b8a6', secondary: '#fff' }
        };

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match", toastCfg);
        }
        if (!formData.termsAccepted) {
            return toast.error("Please accept the terms and conditions", toastCfg);
        }

        setLoading(true);
        const result = await signup(formData);
        if (result.success) {
            toast.success("Registration successful! Verify OTP.", toastCfg);
            setResendTimer(30);
            setStep(5); // Go to OTP verification step
        } else {
            toast.error(result.message, toastCfg);
        }
        setLoading(false);
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        const result = await signup(formData);
        if (result.success) {
            toast.success("New OTP sent to your mobile!", {
                style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
            });
            setResendTimer(30);
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const toastCfg = {
            style: {
                borderRadius: '16px',
                background: '#1e293b',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: '1px solid rgba(20, 184, 166, 0.2)'
            },
            iconTheme: { primary: '#14b8a6', secondary: '#fff' }
        };
        setLoading(true);
        try {
            // Identifier for backend lookup (Email is preferred, Mobile fallback)
            const identifier = formData.email ? formData.email : formData.mobile;
            const result = await verifyOtp(identifier, otp);
            if (result.success) {
                toast.success("Welcome to NowStay!", toastCfg);
                sessionStorage.removeItem('signup_progress'); // Clear on success
                navigate('/');
            } else {
                toast.error(result.message || "Invalid OTP", toastCfg);
            }
        } catch (error) {
            toast.error("Verification failed", toastCfg);
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <User size={10} className="text-primary" /> Full Name
                            </label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                placeholder="e.g. Chandan Sikarwar"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all text-secondary font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Mail size={10} className="text-primary" /> Email Address (Optional)
                            </label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all text-secondary font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Phone size={10} className="text-primary" /> Mobile Number
                            </label>
                            <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange}
                                placeholder="10-digit number" maxLength={10}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all text-secondary font-medium"
                            />
                        </div>
                        <button
                            onClick={nextStep}
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-3 py-4 ${loading ? 'bg-slate-400' : 'bg-secondary'} text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-secondary/20 mt-4 disabled:opacity-70 disabled:cursor-wait`}
                        >
                            {loading ? (
                                <>Validating <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></>
                            ) : (
                                <>Next Step <ChevronRight size={18} /></>
                            )}
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Lock size={10} className="text-primary" /> Password
                            </label>
                            <div className="relative">
                                <input type={showPass ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all text-secondary font-medium"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck size={10} className="text-primary" /> Confirm Password
                            </label>
                            <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all text-secondary font-medium"
                            />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button onClick={nextStep} className="flex-[2] py-4 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2">
                                Next Step <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Globe size={10} className="text-primary" /> Country
                            </label>
                            <input type="text" name="country" required value={formData.country} onChange={handleChange}
                                placeholder="e.g. India"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all text-secondary font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin size={10} className="text-primary" /> City
                            </label>
                            <input type="text" name="city" required value={formData.city} onChange={handleChange}
                                placeholder="e.g. Indore"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all text-secondary font-medium"
                            />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button onClick={nextStep} className="flex-[2] py-4 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2">
                                Next Step <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck size={10} className="text-primary" /> Concierge Access
                                </label>
                                <div className="w-full bg-slate-50 border border-slate-100 text-[10px] px-4 py-3.5 rounded-xl text-secondary font-black uppercase tracking-widest flex items-center gap-2">
                                    24 Hr Available <span className="text-[7px] text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Active</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Ticket size={10} className="text-primary" /> Referral
                                </label>
                                <input type="text" name="referralCode" value={formData.referralCode} onChange={handleChange}
                                    placeholder="Optional"
                                    className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3.5 rounded-xl outline-none text-secondary font-medium"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <ImageIcon size={10} className="text-primary" /> Profile Identity
                            </label>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group overflow-hidden">
                                {picLoading && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                                <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                                    {formData.profilePicture ? (
                                        <img src={formData.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <User size={24} className="text-slate-200" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Select Portrait</p>
                                    <p className="text-[8px] text-slate-400 font-bold mt-0.5">JPG, PNG or WEBP (Standard CDN format)</p>
                                    <div className="relative mt-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                setPicLoading(true);
                                                const d = new FormData();
                                                d.append('image', file);
                                                try {
                                                    const res = await api.post('/media/upload-single', d);
                                                    setFormData(prev => ({ ...prev, profilePicture: res.data.imageUrl }));
                                                } catch (err) { alert("Upload failed"); }
                                                finally { setPicLoading(false); }
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <button type="button" className="text-[9px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/30">
                                            {formData.profilePicture ? 'Update Asset' : 'Upload Asset'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                            <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} className="mt-1 accent-primary w-4 h-4" />
                            <span className="text-[10px] text-slate-500 leading-relaxed">
                                I accept the <Link to="/terms" target="_blank" className="text-primary font-bold underline">Terms & Conditions</Link> and privacy policy of NowStay.
                            </span>
                        </label>

                        <div className="flex gap-3 mt-4">
                            <button type="button" onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button type="submit" disabled={loading} className="flex-[2] py-4 bg-primary text-secondary rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                {loading ? 'Registering...' : 'Complete Signup'} <Sparkles size={16} />
                            </button>
                        </div>
                    </form>
                );
            case 5: // OTP Verification
                return (
                    <div className="space-y-6 animate-in zoom-in duration-500 text-center">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-emerald-100 shadow-xl shadow-emerald-500/10">
                            <ShieldCheck size={40} />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif text-secondary lowercase capitalize">Final <span className="text-primary italic">Verification</span></h2>
                            <p className="text-xs text-slate-400 mt-2">Enter the 6-digit verification code sent to <br /><span className="text-secondary font-bold">{formData.mobile}</span></p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="000000"
                                className="w-48 mx-auto bg-slate-100 border-2 border-slate-200 focus:border-emerald-500 text-2xl font-black text-center tracking-[0.5em] py-4 rounded-2xl outline-none"
                            />
                            <p className="text-[10px] text-slate-400 italic font-medium">Please check your mobile messages for the 6-digit code</p>

                            <div className="flex flex-col items-center gap-2 pt-2">
                                {resendTimer > 0 ? (
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                        Resend OTP in <span className="text-secondary font-bold">{resendTimer}s</span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="text-[9px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/30 hover:text-secondary transition-all disabled:opacity-50"
                                    >
                                        Resend Code Now
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        sessionStorage.removeItem('signup_progress');
                                        window.location.reload(); // Hard reset to recover Step 1
                                    }}
                                    className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2 hover:text-primary transition-all underline underline-offset-4"
                                >
                                    Change Account Details
                                </button>
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length < 6}
                                className="w-full py-4 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                            >
                                {loading ? 'Checking...' : 'Verify & Enter Portal'}
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-10 transition-all duration-700 animate-in fade-in slide-in-from-top-6">
                    <img src="/logo.png" alt="NowStay" className="h-20 w-auto drop-shadow-2xl" />
                    <div className="mt-2 text-center">
                        <p className="text-[10px] font-black tracking-[0.6em] text-secondary uppercase">NowStay</p>
                        <p className="text-[7px] font-bold text-primary tracking-[0.3em] uppercase opacity-60">Hotel & Spa</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
                    <div className="px-8 py-10">
                        {step < 5 && (
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.5em]">Membership</p>
                                    <h1 className="text-2xl font-serif text-secondary lowercase capitalize mt-1">Refined <span className="text-primary italic">Signup</span></h1>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-300">Step</span>
                                    <p className="text-xl font-black text-secondary leading-none">{step}<span className="text-primary">/4</span></p>
                                </div>
                            </div>
                        )}
                        {renderStep()}
                        {step < 5 && (
                            <p className="text-center text-[10px] font-bold text-slate-400 mt-10 uppercase tracking-widest">
                                Already registered?{' '}
                                <Link to="/login" className="text-primary border-b border-primary/30 pb-0.5 ml-1">Secure Sign In</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
