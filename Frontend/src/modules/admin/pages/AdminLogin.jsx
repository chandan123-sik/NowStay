import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Mail, Lock, LogIn, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            if (result.role === 'admin') {
                navigate('/admin');
            } else {
                setError('Access Denied. Only authorized staff can login here.');
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0C111D] flex flex-col items-center justify-center px-4 py-8 font-sans selection:bg-primary/30">
            {/* Top Branding Section */}
            <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-8 duration-1000">
                <div className="bg-slate-800/50 backdrop-blur-xl p-4 rounded-[1.8rem] border border-white/5 shadow-2xl mb-4">
                    <img src="/logo.png" alt="NowStay" className="h-14 w-auto brightness-0 invert opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                </div>
                <div className="text-center space-y-0.5">
                    <h2 className="text-2xl font-serif text-white tracking-widest uppercase">NowStay</h2>
                    <div className="flex items-center gap-2">
                        <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-primary/50"></div>
                        <p className="text-[9px] font-bold text-primary tracking-[0.3em] uppercase">Management Portal</p>
                        <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-primary/50"></div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[380px] relative group">
                {/* Decorative Glows */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 via-transparent to-primary/15 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-80 transition duration-1000"></div>
                
                <div className="relative bg-[#151B28] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
                    {/* Visual Header with Gradient Overlay */}
                    <div className="relative px-6 pt-8 pb-12 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl transform transition-transform group-hover:scale-105 duration-500">
                                <ShieldCheck size={28} className="text-primary drop-shadow-[0_0_8px_rgba(199,168,76,0.3)]" />
                            </div>
                            <h1 className="text-2xl font-serif text-white mb-1 leading-tight">Admin Login</h1>
                            <p className="text-slate-400 text-[11px] font-medium tracking-wide">
                                Administrative Gateway Access
                            </p>
                        </div>
                    </div>

                    <div className="px-8 -mt-6 pb-8 relative z-20">
                        <div className="space-y-4">
                            {error && (
                                <div className="bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] p-3 rounded-xl font-medium flex items-center gap-2 animate-shake">
                                    <div className="shrink-0 w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center text-[8px]">⚠</div>
                                    {error}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1 flex items-center gap-1.5">
                                        <Mail size={11} className="text-primary/70" /> Email ID
                                    </label>
                                    <input
                                        type="email" required value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="admin@nowstay.com"
                                        className="w-full bg-[#0C111D] border border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-[16px] sm:text-xs px-4 py-3 rounded-xl outline-none transition-all text-white font-medium placeholder:text-slate-700 shadow-inner"
                                    />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1 flex items-center gap-1.5">
                                        <Lock size={11} className="text-primary/70" /> Security Key
                                    </label>
                                    <div className="relative group/field">
                                        <input
                                            type={showPass ? 'text' : 'password'} required value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-[#0C111D] border border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-[16px] sm:text-xs px-4 py-3 pr-12 rounded-xl outline-none transition-all text-white font-medium placeholder:text-slate-700 shadow-inner"
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className={`group relative overflow-hidden w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all
                                        ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-primary text-[#151B28] hover:shadow-[0_0_20px_rgba(199,168,76,0.2)] hover:-translate-y-0.5 active:translate-y-0'}`}>
                                    {/* Button Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-slate-600 border-t-primary rounded-full animate-spin" />
                                            Verifying...
                                        </span>
                                    ) : (
                                        <>
                                            <ShieldCheck size={16} className="transition-transform group-hover:scale-110" />
                                            <span>Enter Portal</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
