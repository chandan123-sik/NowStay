import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../../context/WalletContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import {
    CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Ticket,
    Sparkles, TrendingUp, X, Check
} from 'lucide-react';

const quickAmounts = [500, 1000, 2000, 5000];

const Wallet = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { balance, transactions, coupons, verifyAndAddFunds } = useWallet();
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [success, setSuccess] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const handleAddFunds = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || Number(amount) <= 0) return;

        try {
            setLoadingPayment(true);
            // 1. Create order on backend
            const { data: order } = await api.post('/transactions/create-order', { amount: Number(amount) });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_8sYbzHWidwe5Zw',
                amount: order.amount,
                currency: order.currency,
                name: "Ananya Hotel",
                description: "Wallet Recharge",
                order_id: order.id,
                handler: async (response) => {
                    const success = await verifyAndAddFunds(response, Number(amount));
                    if (success) {
                        setSuccess(true);
                        setTimeout(() => {
                            setSuccess(false);
                            setShowModal(false);
                            setAmount('');
                        }, 2000);
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                    setLoadingPayment(false);
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: user?.phone || ""
                },
                theme: { color: "#1E293B" }, // Secondary color
                modal: {
                    ondismiss: () => setLoadingPayment(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Payment initiation failed:', error);
            alert("Could not initiate payment. Try again.");
            setLoadingPayment(false);
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code).catch(() => { });
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const totalSpent = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const totalAdded = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-6 md:pb-10">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-50 px-4 py-4 shadow-sm sticky top-0 z-50">
                <p className="text-[7px] font-bold text-primary uppercase tracking-[0.4em]">Hotel Ananya</p>
                <h1 className="text-sm font-serif text-secondary mt-0.5 uppercase tracking-widest">My <span className="text-primary italic">Wallet</span></h1>
            </div>

            <div className="px-4 pt-5 space-y-4 max-w-2xl mx-auto">

                {/* Main Balance Card */}
                <div className="relative bg-secondary rounded-2xl overflow-hidden shadow-xl shadow-secondary/20 p-5">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-white/40 text-[8px] font-bold uppercase tracking-[0.3em]">Available Balance</p>
                                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">₹{balance.toLocaleString()}</h2>
                            </div>
                            <div className="w-10 h-10 bg-primary/20 border border-primary/20 rounded-xl flex items-center justify-center">
                                <CreditCard size={18} className="text-primary" />
                            </div>
                        </div>

                        {/* Mini Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                                <p className="text-white/30 text-[7px] font-bold uppercase tracking-wider">Deposits</p>
                                <p className="text-emerald-400 font-bold text-sm mt-0.5">+₹{totalAdded.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                                <p className="text-white/30 text-[7px] font-bold uppercase tracking-wider">Spending</p>
                                <p className="text-rose-400 font-bold text-sm mt-0.5">-₹{totalSpent.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setShowModal(true)}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-secondary py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest active:scale-95 transition-all shadow-md">
                                <Plus size={14} /> Add Funds
                            </button>
                            <button
                                onClick={() => navigate('/wallet/history')}
                                className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest active:scale-90 transition-all"
                            >
                                <TrendingUp size={14} /> History
                            </button>
                        </div>
                    </div>
                </div>

                {/* Coupons Section */}
                {coupons.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2">
                            <Ticket size={14} className="text-primary" />
                            <h2 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Exclusive Luxury Offers</h2>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {coupons.map(coupon => (
                                <div key={coupon.id} className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/5 text-primary rounded-lg flex items-center justify-center font-bold text-[10px] border border-primary/10">
                                            {coupon.discount}%
                                        </div>
                                        <div>
                                            <p className="text-secondary font-bold text-xs tracking-tight">{coupon.code}</p>
                                            <p className="text-slate-400 text-[8px] mt-0.5">{coupon.description}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleCopy(coupon.code)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all border active:scale-90
                                            ${copiedCode === coupon.code ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-primary/40'}`}>
                                        {copiedCode === coupon.code ? <><Check size={10} /> Saved</> : 'Copy'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Platinum Tip */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-primary uppercase tracking-widest">Guest Milestone</p>
                        <p className="text-secondary text-[10px] font-medium mt-0.5 leading-relaxed tracking-tight">
                            Maintain <span className="font-bold">₹5,000+</span> to unlock <span className="font-bold text-primary italic">Ananya Platinum</span> status!
                        </p>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2">
                        <TrendingUp size={14} className="text-primary" />
                        <h2 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Transaction History</h2>
                    </div>
                    <div>
                        {transactions.length > 0 ? transactions.map((t) => (
                            <div key={t._id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                    ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                    {t.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-secondary font-bold text-xs truncate">{t.description}</p>
                                    <p className="text-slate-400 text-[8px] font-medium mt-0.5 capitalize">{new Date(t.createdAt).toLocaleDateString()} · {t.type}</p>
                                </div>
                                <p className={`font-bold text-xs flex-shrink-0 ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                </p>
                            </div>
                        )) : (
                            <div className="py-14 text-center space-y-2">
                                <CreditCard size={32} className="text-slate-200 mx-auto" />
                                <p className="text-slate-400 text-sm font-medium">No transactions yet</p>
                                <p className="text-slate-300 text-xs">Start your Ananya journey!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Funds Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white relative z-10 w-full max-w-[320px] rounded-2xl shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-secondary px-5 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-primary text-[7px] font-bold uppercase tracking-widest">Secure Gateway</p>
                                <h3 className="text-white font-serif text-base mt-0.5 lowercase capitalize">Add Wallet Funds</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {success ? (
                                <div className="py-6 text-center space-y-3">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                                        <Check size={24} className="text-emerald-600" />
                                    </div>
                                    <p className="text-secondary font-bold text-base">Success!</p>
                                    <p className="text-slate-400 text-[10px]">₹{Number(amount).toLocaleString()} added to your sanctuary wallet.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleAddFunds} className="space-y-5">
                                    {/* Quick amounts */}
                                    <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Select Amount</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {quickAmounts.map(a => (
                                                <button key={a} type="button" onClick={() => setAmount(String(a))}
                                                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all active:scale-90
                                                        ${amount === String(a) ? 'bg-secondary text-white border-secondary' : 'bg-slate-50 text-secondary border-slate-100 hover:border-primary/40'}`}>
                                                    ₹{a}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom input */}
                                    <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Custom Value</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm">₹</span>
                                            <input
                                                type="number" min="1" value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                placeholder="Enter amount"
                                                className="w-full bg-slate-50 border border-slate-100 focus:border-primary text-lg font-bold text-secondary pl-8 pr-4 py-3 rounded-lg outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button type="button" onClick={() => setShowModal(false)}
                                            className="flex-1 py-3 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 hover:text-secondary">
                                            Cancel
                                        </button>
                                        <button type="submit"
                                            disabled={!amount || isNaN(amount) || Number(amount) <= 0 || loadingPayment}
                                            className="flex-1 py-3 bg-secondary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest active:scale-95 disabled:bg-slate-50 disabled:text-slate-200 flex items-center justify-center">
                                            {loadingPayment ? (
                                                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            ) : 'Process'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;

