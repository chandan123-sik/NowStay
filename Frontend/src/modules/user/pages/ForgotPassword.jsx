import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Mail, ShieldCheck, Lock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            if (data.success) {
                setStep(2);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error sending reset OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return alert("Passwords do not match");
        if (newPassword.length < 6) return alert("Password must be at least 6 characters");

        setLoading(true);
        try {
            const { data } = await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            if (data.success) {
                setStep(3); // Component success view
            }
        } catch (error) {
            alert(error.response?.data?.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                    <div className="px-8 py-10">
                        {step === 1 && (
                            <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center">
                                    <h1 className="text-2xl font-serif text-secondary lowercase capitalize">Password <span className="text-primary italic">Recovery</span></h1>
                                    <p className="text-xs text-slate-400 mt-2 italic px-6">Enter your email or mobile number and we'll send a 6-digit rescue code to your registered device.</p>
                                </div>
                                <div className="space-y-1.5 mt-8">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                        <Mail size={10} className="text-primary" /> Registered Email or Mobile
                                    </label>
                                    <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="Email or Mobile"
                                        className="w-full bg-slate-100 border border-slate-200 focus:border-emerald-500 text-sm px-4 py-4 rounded-xl outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-4 mt-8">
                                    <button type="submit" disabled={loading} className="w-full py-4 bg-secondary text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-secondary/20 flex items-center justify-center gap-2">
                                        {loading ? 'Dispatching...' : 'Send Rescue Code'} <ChevronRight size={18} />
                                    </button>
                                    <Link to="/login" className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-secondary flex items-center justify-center gap-1">
                                        <ChevronLeft size={14} /> Back to Entry
                                    </Link>
                                </div>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleResetPassword} className="space-y-6 animate-in zoom-in duration-500">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-xl shadow-emerald-500/10">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <div className="space-y-1.5 text-center">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verification Code</label>
                                        <input
                                            type="text" required maxLength={6} value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            placeholder="000000"
                                            className="w-48 mx-auto bg-slate-100 border-2 border-slate-200 focus:border-emerald-500 text-2xl font-black text-center tracking-[0.5em] py-4 rounded-2xl outline-none mt-2 block"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Lock size={10} className="text-primary" /> New Security Key</label>
                                            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-100 border border-slate-200 focus:border-emerald-500 text-sm px-4 py-4 rounded-xl outline-none" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Lock size={10} className="text-primary" /> Confirm Security Key</label>
                                            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                                className="w-full bg-slate-100 border border-slate-200 focus:border-emerald-500 text-sm px-4 py-4 rounded-xl outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading || otp.length < 6} className="w-full py-4 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                                    {loading ? 'Redefining...' : 'Secure Account'}
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-6 animate-in zoom-in-50 duration-500">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-xl shadow-emerald-500/20">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-serif text-secondary lowercase capitalize">Access <span className="text-emerald-500 italic">Restored</span></h1>
                                    <p className="text-xs text-slate-400 mt-2 px-8">Your security key has been redefined successfully. You can now re-enter the portal.</p>
                                </div>
                                <button onClick={() => navigate('/login')} className="w-full py-4 bg-secondary text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-2 mt-8">
                                    Step into Portal <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
