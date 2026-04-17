import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpStep, setOtpStep] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const { login, verifyOtp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Step 1: Login attempt
        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else if (result.otpRequired) {
            setOtpStep(true);
            setResendTimer(30);
        } else {
            const toastCfg = { style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '10px', fontWeight: 'bold' } };
            toast.error(result.message, toastCfg);
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await verifyOtp(email, otp);
        const toastCfg = { style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '10px', fontWeight: 'bold' } };
        if (result.success) {
            toast.success("Welcome Back!", toastCfg);
            navigate('/');
        } else {
            toast.error(result.message || "Invalid OTP", toastCfg);
        }
        setLoading(false);
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        const result = await login(email, password);
        if (result.otpRequired) {
            toast.success("New code dispatched!", { style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '10px', fontWeight: 'bold' } });
            setResendTimer(30);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Brand Logo */}
                <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-6 duration-700">
                    <img src="/logo.png" alt="NowStay" className="h-20 w-auto drop-shadow-2xl" />
                    <div className="mt-2 text-center">
                        <p className="text-[10px] font-black tracking-[0.6em] text-secondary uppercase">NowStay</p>
                        <p className="text-[7px] font-bold text-primary tracking-[0.3em] uppercase opacity-60">Hotel & Spa</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                    <div className="px-8 py-10">
                        <div className="mb-10 text-center">
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.5em]">Welcome Back</p>
                            <h1 className="text-2xl font-serif text-secondary lowercase capitalize mt-1">
                                Secure <span className="text-primary italic">{otpStep ? 'Verification' : 'Login'}</span>
                            </h1>
                        </div>

                        {!otpStep ? (
                            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                        <Mail size={10} className="text-primary" /> Email or Mobile
                                    </label>
                                    <input
                                        type="text" required value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="Email or Mobile Number"
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all text-secondary font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Lock size={10} className="text-primary" /> Authority Key
                                        </label>
                                        <Link to="/forgot-password" title="Recover Access" className="text-[8px] font-black text-primary uppercase tracking-widest hover:text-secondary transition-colors">Lost Access?</Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all text-secondary font-medium"
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary transition-colors">
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 py-4 bg-secondary text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-secondary/20 mt-6">
                                    {loading ? 'Authenticating...' : 'Enter Sanctuary'} <LogIn size={18} />
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in zoom-in duration-500 text-center">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-emerald-100 shadow-xl shadow-emerald-500/10">
                                    <ShieldCheck size={32} />
                                </div>
                                <p className="text-xs text-slate-400">Enter the 6-digit verification code sent to your mobile</p>

                                <div className="space-y-4">
                                    <input
                                        type="text" required maxLength={6} value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        placeholder="000000"
                                        className="w-48 mx-auto bg-slate-50 border-2 border-slate-200 focus:border-primary text-2xl font-black text-center tracking-[0.5em] py-4 rounded-2xl outline-none block"
                                    />
                                    <button type="button" onClick={() => setOtpStep(false)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1 mx-auto mt-4 hover:text-secondary">
                                        <ArrowLeft size={10} /> Back to Password
                                    </button>

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
                                    </div>

                                    <button type="submit" disabled={loading || otp.length < 6} className="w-full py-4 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
                                        {loading ? 'Verifying...' : 'Validate & Enter'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <p className="text-center text-[10px] font-bold text-slate-400 mt-10 uppercase tracking-widest">
                            New to Sanctuary?{' '}
                            <Link to="/signup" className="text-primary border-b border-primary/30 pb-0.5 ml-1">Create Account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
