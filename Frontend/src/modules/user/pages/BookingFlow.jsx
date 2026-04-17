import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useWallet } from '../../../context/WalletContext';
import {
    Calendar, Users, ShieldCheck, ArrowRight, CreditCard,
    Wifi, Coffee, Wind, Tv, ChevronLeft, Star, MapPin,
    BedDouble, Maximize2, CheckCircle2, ChevronRight, Info, Plus, X, ChevronDown, Check,
    Zap, Sparkles, Download, Ticket
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { getAmenityIcon } from '../../../utils/amenityIcons';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────── */
const nights = (ci, co) => {
    if (!ci || !co) return 1;
    const diff = (new Date(co) - new Date(ci)) / 86400000;
    return diff > 0 ? diff : 1;
};

const BookingFlow = () => {
    const { user } = useAuth();
    const { balance } = useWallet();
    const navigate = useNavigate();
    const location = useLocation();
    const room = location.state?.room;

    useEffect(() => {
        if (user?.status === 'blocked') {
            toast.error('Your account is currently restricted. Please contact support.', { icon: '🚫' });
            navigate('/profile');
        }
    }, [user?.status]);

    const departureRef = useMemo(() => ({ current: null }), []); // Simple ref for showPicker
    const checkoutInputRef = (el) => departureRef.current = el;

    const [step, setStep] = useState(1);
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [isAvailable, setIsAvailable] = useState(false);
    const [checking, setChecking] = useState(false);

    // Dynamic data
    const [variants, setVariants] = useState([]);
    const [pricingMeta, setPricingMeta] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [availableCount, setAvailableCount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [pricesUpdating, setPricesUpdating] = useState(false);
    const [dailyBreakdown, setDailyBreakdown] = useState([]);

    // Modal state (Guest details)
    const [numRooms, setNumRooms] = useState(1);
    const [roomDetails, setRoomDetails] = useState([{ adults: 2, children: 0 }]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [taxes, setTaxes] = useState([]);
    const [propertySettings, setPropertySettings] = useState({ payAtHotelEnabled: true, partialPaymentPercentage: 25 });
    const [bookingId] = useState(`AN-${Math.floor(Math.random() * 90000) + 10000}`);
    const [paymentPlan, setPaymentPlan] = useState('full'); // 'full' or 'partial'
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [publicCoupons, setPublicCoupons] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 10);
        return () => clearTimeout(timer);
    }, [location.key]);

    useEffect(() => {
        api.get('/setup/property').then(res => {
            if (res.data) setPropertySettings({
                payAtHotelEnabled: res.data.payAtHotelEnabled ?? true,
                partialPaymentPercentage: res.data.partialPaymentPercentage ?? 25
            });
        });
        api.get('/discounts').then(res => {
            if (res.data) setPublicCoupons(res.data.filter(c => c.active));
        });
    }, []);

    useEffect(() => {
        if (room?._id) {
            setPricesUpdating(true);
            api.post('/rooms/variants-with-pricing', {
                roomTypeId: room._id,
                checkIn: dates.checkIn,
                checkOut: dates.checkOut,
                roomDetails
            }).then(res => {
                const fetchedVariants = res.data.variants;
                setVariants(fetchedVariants);
                setPricingMeta(res.data.pricingMeta);
                if (!selectedPlan) setTotalPrice(res.data.suggestedTotal);

                // Show toast if ALL variants are blocked
                if (dates.checkIn && dates.checkOut && fetchedVariants.length > 0) {
                    const allBlocked = fetchedVariants.every(v => v.isStopSell || v.isSoldOut);
                    if (allBlocked) {
                        toast.error("SANCTUARY FULLY BOOKED: The selected dates are currently sold out. Please explore other dates.", {
                            icon: '🚫',
                            style: { border: '1px solid #14b8a6', borderLeft: '4px solid #14b8a6' }
                        });
                    }
                }

                setPricesUpdating(false);
            }).catch(() => setPricesUpdating(false));
            api.get('/setup/taxes').then(res => setTaxes(res.data));
        }
    }, [room?._id, dates.checkIn, dates.checkOut, roomDetails]);

    useEffect(() => {
        if (selectedVariant) {
            api.post('/rooms/variant-plans-pricing', {
                variantId: selectedVariant._id,
                checkIn: dates.checkIn,
                checkOut: dates.checkOut,
                roomDetails
            }).then(res => setPlans(res.data));
        }
    }, [selectedVariant, dates.checkIn, dates.checkOut, roomDetails]);

    useEffect(() => {
        if (selectedPlan && dates.checkIn && dates.checkOut && roomDetails.length > 0) {
            api.post('/rooms/calculate-pricing', {
                roomTypeId: room._id,
                variantId: selectedVariant?._id,
                planId: selectedPlan._id,
                checkIn: dates.checkIn,
                checkOut: dates.checkOut,
                roomDetails
            }).then(res => {
                setTotalPrice(res.data.total);
            });
        }
    }, [selectedPlan, dates.checkIn, dates.checkOut, roomDetails]);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
        };
    }, []);

    // Prevent back navigation after confirmation
    useEffect(() => {
        if (step === 4) {
            window.history.pushState(null, '', window.location.href);
            const handlePopState = (e) => {
                window.history.pushState(null, '', window.location.href);
            };
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [step]);

    useEffect(() => {
        const count = parseInt(numRooms) || 1;
        setRoomDetails(prev => {
            const next = [...prev];
            if (next.length < count) {
                for (let i = next.length; i < count; i++) next.push({ adults: 2, children: 0 });
            } else {
                return next.slice(0, count);
            }
            return next;
        });
    }, [numRooms]);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        try {
            const { data } = await api.post('/discounts/validate', { code: couponCode });
            if (data.success) {
                const c = data.coupon;
                let d = 0;
                if (c.type === 'percentage') {
                    d = (totalBase + taxTotal) * (c.value / 100);
                } else {
                    d = c.value;
                }
                setDiscount(d);
                setCouponApplied(true);
                toast.success(`Coupon Applied! Extra ₹${Math.round(d).toLocaleString()} off`, {
                    style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid coupon", {
                style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
            });
        }
    };

    const handleRemoveCoupon = () => {
        setDiscount(0);
        setCouponApplied(false);
        setCouponCode('');
        toast.success("Voucher removed", {
            style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        });
    };

    const handleCheckAvailability = async (variant) => {
        if (!dates.checkIn || !dates.checkOut) return alert('Please select dates first');
        setChecking(true);
        try {
            const { data } = await api.post('/rooms/check-availability', {
                roomTypeId: room._id,
                variantId: variant._id,
                checkIn: dates.checkIn,
                checkOut: dates.checkOut,
                roomsCount: numRooms
            });
            if (data.available) {
                setSelectedVariant(variant);
                setAvailableCount(data.availableCount);
                setStep(2); // Go to Plans
            } else {
                alert(`No ${variant.name} rooms available for these dates.`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setChecking(false);
        }
    };

    const calculateRoomBase = (details, plan) => {
        let p = 0;
        if (details.adults === 1) p = plan.adult1Price;
        else if (details.adults === 2) p = plan.adult2Price;
        else p = plan.adult2Price + plan.extraAdultPrice;

        p += (details.children * plan.childPrice);
        return p;
    };

    const stayNights = nights(dates.checkIn, dates.checkOut);
    const totalBase = totalPrice;
    const taxTotal = taxes.reduce((sum, t) => sum + (totalBase * t.rate / 100), 0);
    const grandTotal = Math.max(0, (totalBase + taxTotal) - discount);

    const depositAmount = Math.round(grandTotal * (propertySettings.partialPaymentPercentage / 100));
    const amountToPayNow = paymentPlan === 'full' ? grandTotal : depositAmount;

    const handleWalletPayment = async () => {
        try {
            await api.post('/bookings', {
                userId: user._id,
                roomType: room?._id,
                variant: selectedVariant?._id,
                plan: selectedPlan?._id,
                checkIn: dates.checkIn,
                checkOut: dates.checkOut,
                roomsCount: numRooms,
                roomDetails,
                totalPrice: grandTotal,
                amountPaid: amountToPayNow,
                paymentStatus: paymentPlan === 'full' ? 'paid' : 'partial',
                bookingId,
                paymentMethod: 'wallet'
            });
            setStep(4);
        } catch (error) {
            alert(error.response?.data?.message || 'Booking failed');
        }
    };

    const handleRazorpayPayment = async () => {
        if (!window.Razorpay) {
            api.get('/rooms/categories'); // dummy to trigger refresh if script failed
            alert('Payment gateway is still loading. Please wait a few seconds.');
            return;
        }

        if (!user) {
            alert('Your session has expired. Please log in again to continue.');
            navigate('/login');
            return;
        }

        try {
            const { data: order } = await api.post('/payments/create-order', {
                amount: Math.round(grandTotal),
                receipt: bookingId
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'NowStay',
                description: `${selectedVariant?.name}: ${selectedPlan?.planName}`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        const { data: verifyData } = await api.post('/payments/verify-payment', response);
                        if (verifyData.success) {
                            await api.post('/bookings', {
                                userId: user._id,
                                roomType: room?._id,
                                variant: selectedVariant?._id,
                                plan: selectedPlan?._id,
                                checkIn: dates.checkIn,
                                checkOut: dates.checkOut,
                                roomsCount: numRooms,
                                roomDetails,
                                totalPrice: grandTotal,
                                amountPaid: amountToPayNow,
                                paymentStatus: paymentPlan === 'full' ? 'paid' : 'partial',
                                bookingId,
                                paymentMethod: 'razorpay',
                                paymentId: response.razorpay_payment_id
                            });
                            setStep(4);
                        }
                    } catch (err) {
                        alert('Payment verification failed.');
                    }
                },
                prefill: { name: user?.name || '', email: user?.email || '' },
                theme: { color: '#1e293b' },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (r) => alert(`Payment Failure: ${r.error.description}`));
            rzp.open();

        } catch (error) {
            const serverMsg = error.response?.data?.message || 'Gateway unreachable';
            alert(`Payment Error: ${serverMsg}`);
        }
    };

    if (!room) return <div className="p-20 text-center"><button onClick={() => navigate('/rooms')} className="bg-secondary text-white px-8 py-3 rounded-xl">Go Back</button></div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                {step < 4 ? (
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                        className="p-2 hover:bg-slate-50 rounded-sm transition-all text-slate-400"
                    >
                        <ChevronLeft size={20} />
                    </button>
                ) : (
                    <div className="w-9" /> // Spacer to keep title centered when back button is hidden
                )}
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-bold text-primary uppercase tracking-[0.3em]">NowStay</span>
                    <h2 className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em]">
                        {step === 1 ? 'Select Variant' : step === 2 ? 'Choose Plan' : step === 3 ? 'Finalize' : 'Confirm'}
                    </h2>
                </div>
                <div className="w-7 h-7 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-center text-secondary font-bold text-[10px]">
                    {step}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 mt-8">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Compact Precise Dates Header */}
                        <div className="bg-white rounded-sm p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 w-full grid grid-cols-2 gap-4 relative">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className="w-3 h-[1px] bg-primary" />
                                            <label className="text-[9px] font-bold text-primary uppercase tracking-[0.1em]">Arrival</label>
                                        </div>
                                        <div className={`relative transition-all duration-300 ${!dates.checkIn ? 'ring-1 ring-primary/20' : ''}`}>
                                            <Calendar size={12} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${dates.checkIn ? 'text-primary' : 'text-slate-300'}`} />
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={dates.checkIn}
                                                onChange={e => {
                                                    const newIn = e.target.value;
                                                    setDates(prev => {
                                                        const next = { ...prev, checkIn: newIn };
                                                        if (!prev.checkOut || prev.checkOut <= newIn) {
                                                            const d = new Date(newIn);
                                                            d.setDate(d.getDate() + 1);
                                                            next.checkOut = d.toISOString().split('T')[0];
                                                        }
                                                        return next;
                                                    });
                                                    setTimeout(() => {
                                                        if (departureRef.current?.showPicker) {
                                                            departureRef.current.showPicker();
                                                        } else {
                                                            departureRef.current?.focus();
                                                        }
                                                    }, 100);
                                                }}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm pl-10 pr-4 py-2.5 text-[10px] font-bold text-secondary outline-none focus:bg-white focus:ring-1 focus:ring-primary/10 transition-all appearance-none uppercase tracking-wide"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className="w-3 h-[1px] bg-slate-300" />
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">Departure</label>
                                        </div>
                                        <div className={`relative transition-all duration-300 ${dates.checkIn && !dates.checkOut ? 'ring-1 ring-primary/20 scale-[1.01]' : ''}`}>
                                            <Calendar size={12} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${dates.checkOut ? 'text-primary' : 'text-slate-300'}`} />
                                            <input
                                                ref={checkoutInputRef}
                                                type="date"
                                                disabled={!dates.checkIn}
                                                min={dates.checkIn ? (() => {
                                                    const d = new Date(dates.checkIn);
                                                    d.setDate(d.getDate() + 1);
                                                    return d.toISOString().split('T')[0];
                                                })() : new Date().toISOString().split('T')[0]}
                                                value={dates.checkOut}
                                                onChange={e => setDates({ ...dates, checkOut: e.target.value })}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm pl-10 pr-4 py-2.5 text-[10px] font-bold text-secondary outline-none focus:bg-white focus:ring-1 focus:ring-primary/10 transition-all appearance-none uppercase tracking-wide disabled:opacity-40"
                                            />
                                        </div>
                                    </div>

                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 hidden md:block">
                                        <div className={`w-8 h-8 bg-white border border-slate-200 rounded-sm flex items-center justify-center shadow-sm transition-transform duration-500 ${dates.checkIn ? 'text-primary translate-x-1' : 'text-slate-200'}`}>
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guest & Sanctuary Selection - COMPACT */}
                        <div className="bg-white rounded-sm p-5 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-sm border border-slate-200">
                                <div>
                                    <h3 className="text-secondary text-[10px] font-bold uppercase tracking-widest">Select Sanctuaries</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setNumRooms(Math.max(1, numRooms - 1))}
                                        className="w-7 h-7 rounded-sm bg-white border border-slate-300 flex items-center justify-center text-slate-500 hover:text-primary transition-all active:scale-90 shadow-sm"
                                    ><ChevronLeft size={12} /></button>
                                    <div className="flex flex-col items-center px-1 min-w-[30px]">
                                        <span className="text-xs font-bold text-secondary leading-none">{numRooms}</span>
                                        <span className="text-[6px] font-bold text-slate-500 uppercase">Rooms</span>
                                    </div>
                                    <button
                                        onClick={() => setNumRooms(numRooms + 1)}
                                        className="w-7 h-7 rounded-sm bg-white border border-slate-300 flex items-center justify-center text-slate-500 hover:text-primary transition-all active:scale-90 shadow-sm"
                                    ><ChevronRight size={12} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {roomDetails.map((details, index) => (
                                    <div key={index} className="p-3 rounded-sm border border-slate-200 bg-white space-y-2 hover:border-primary/40 transition-all group">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.1em]">Room {index + 1}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <select
                                                        value={details.adults}
                                                        onChange={e => {
                                                            const copy = [...roomDetails];
                                                            copy[index].adults = parseInt(e.target.value);
                                                            setRoomDetails(copy);
                                                        }}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-1.5 text-[9px] font-bold text-secondary outline-none appearance-none uppercase transition-all hover:border-primary/30"
                                                    >
                                                        <option value="1">1 Adult @ ₹{pricingMeta?.adult1 || 0}</option>
                                                        <option value="2">2 Adults @ ₹{pricingMeta?.adult2 || 0}</option>
                                                        <option value="3">3 Adults (Incl. Extra) @ ₹{(pricingMeta?.adult2 || 0) + (pricingMeta?.extraAdult || 0)}</option>
                                                    </select>
                                                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <select
                                                        value={details.children}
                                                        onChange={e => {
                                                            const copy = [...roomDetails];
                                                            copy[index].children = parseInt(e.target.value);
                                                            setRoomDetails(copy);
                                                        }}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-1.5 text-[9px] font-bold text-secondary outline-none appearance-none uppercase transition-all hover:border-primary/30"
                                                    >
                                                        <option value="0">0 Child</option>
                                                        <option value="1">1 Child @ ₹{pricingMeta?.child || 0}</option>
                                                        <option value="2">2 Kids @ ₹{(pricingMeta?.child || 0) * 2}</option>
                                                    </select>
                                                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Variants Header */}
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h3 className="font-bold text-xl text-secondary uppercase tracking-tight">Select your <span className="text-primary">sanctuary</span></h3>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-1">Found {variants.length} available configurations</p>
                            </div>
                        </div>

                        {/* Variants Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {variants.map(v => (
                                <div key={v._id} className="bg-white rounded-sm overflow-hidden border border-slate-200 shadow-sm group hover:shadow-md transition-all duration-300 flex flex-col">
                                    <div className="h-40 relative overflow-hidden">
                                        <img src={v.images?.[0] || room.images?.[0]} className="w-full h-full object-cover" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent opacity-40" />

                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {v.name.toLowerCase().includes('classic') && (
                                                <span className="bg-primary text-white text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">Popular Choice</span>
                                            )}
                                        </div>

                                        <div className="absolute bottom-3 left-4 right-4">
                                            <p className="text-primary text-[7px] font-bold uppercase tracking-[0.2em] mb-0.5">{room.name}</p>
                                            <h3 className="text-white text-base font-bold uppercase tracking-tight">{v.name}</h3>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                                        <div className="flex flex-wrap gap-2.5">
                                            {[
                                                { icon: Wifi, label: 'Wifi' },
                                                { icon: Wind, label: 'AC' },
                                                { icon: Tv, label: 'TV' },
                                                { icon: Coffee, label: 'Mini Bar' }
                                            ].map(({ icon: Icon, label }) => (
                                                <div key={label} className="flex items-center gap-1.5 opacity-80">
                                                    <Icon size={11} className="text-secondary" />
                                                    <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <div className="space-y-0.5">
                                                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Available from</p>
                                                <p className={`text-[13px] font-bold uppercase transition-all duration-300 ${pricesUpdating || v.isStopSell || v.isSoldOut ? 'text-slate-200 blur-[2px]' : 'text-secondary'}`}>
                                                    ₹{v.basePrice || '4,500'}
                                                    <span className="text-[8px] text-slate-400 ml-1">/NT</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleCheckAvailability(v)}
                                                disabled={checking || v.isStopSell || v.isSoldOut}
                                                className={`py-2 px-4 rounded-sm font-bold uppercase tracking-widest text-[8px] transition-all flex items-center justify-center gap-2 shadow-sm group/btn ${v.isStopSell || v.isSoldOut ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-secondary text-white hover:bg-primary'}`}
                                            >
                                                {checking ? '...' : (v.isStopSell || v.isSoldOut ? 'Sold Out' : (
                                                    <>
                                                        Explore
                                                        <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </>
                                                ))}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-700">
                        <div className="text-center space-y-2">
                            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] block">{selectedVariant?.name}</span>
                            <h2 className="text-2xl font-bold text-secondary uppercase tracking-tight">Explore our <span className="text-primary">offerings</span></h2>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.1em]">Live availability: {availableCount} sanctuaries remaining</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {plans.length > 0 ? plans.map(p => (
                                <div key={p._id} className="bg-white rounded-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all group">
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-start">
                                            {p.planImage ? (
                                                <div className="w-12 h-12 rounded-sm border border-slate-200 overflow-hidden shadow-sm">
                                                    <img src={p.planImage} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="p-2.5 bg-slate-50 text-primary border border-slate-200 rounded-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <Star size={18} />
                                                </div>
                                            )}
                                            <div className="text-right">
                                                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Rate Plan</p>
                                                <h3 className="text-xs font-bold text-secondary uppercase tracking-tight">{p.planName}</h3>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Coffee size={14} className="text-primary" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest">{p.mealsIncluded}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold leading-relaxed">{p.planDescription || 'Luxurious stay with curated amenities tailored for tranquility.'}</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-200 mt-6">
                                        <div className="space-y-1">
                                            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none">Calculated Investment</p>
                                            <div className="flex flex-col">
                                                <p className="text-[19px] font-bold text-secondary tracking-tight leading-tight">
                                                    ₹{Math.round(p.avgNightly || 0).toLocaleString()}
                                                    <span className="text-[9px] font-bold text-slate-400 ml-1 tracking-normal">/NIGHT AVG</span>
                                                </p>
                                                <p className="text-[7px] font-bold text-primary uppercase tracking-widest mt-1">₹{p.dynamicTotal?.toLocaleString()} Total Stay</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedPlan(p);
                                                setStep(3);
                                            }}
                                            className="w-full mt-4 py-2.5 bg-secondary text-white rounded-sm flex items-center justify-center hover:bg-primary transition-all active:scale-95 text-[9px] font-bold uppercase tracking-widest gap-2"
                                        >
                                            Confirm Plan <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full text-center py-16 bg-white rounded-sm border border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                                    No pricing configurations found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-white rounded-sm p-8 border border-slate-200 shadow-sm space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mb-1.5">Final Step</p>
                                    <h1 className="text-2xl font-bold text-secondary uppercase tracking-tight leading-none">Complete <span className="text-primary italic">reservation</span></h1>
                                </div>
                                <ShieldCheck size={32} className="text-emerald-600" />
                            </div>

                            <div className="bg-slate-50 rounded-sm p-6 border border-slate-200 grid grid-cols-2 gap-x-8 gap-y-5">
                                <div className="space-y-1">
                                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Sanctuary</p>
                                    <p className="text-[10px] font-bold text-secondary uppercase tracking-tight">{selectedVariant?.name}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Lifecycle</p>
                                    <p className="text-[9px] font-bold text-secondary">{new Date(dates.checkIn).toLocaleDateString()} — {new Date(dates.checkOut).toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Tier Level</p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-tight line-clamp-1">{selectedPlan?.planName}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Stay Metrics</p>
                                    <p className="text-[10px] font-bold text-secondary uppercase tracking-tight">{numRooms} Units · {stayNights} Nights</p>
                                </div>
                            </div>

                            <div className="space-y-6 px-1">
                                {/* Payment Options Selector */}
                                <div className={`grid ${propertySettings.payAtHotelEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-6`}>
                                    <button
                                        onClick={() => setPaymentPlan('full')}
                                        className={`p-4 rounded-sm border transition-all flex flex-col items-center gap-2 group ${paymentPlan === 'full' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <ShieldCheck size={16} className={paymentPlan === 'full' ? 'text-primary' : 'text-slate-400'} />
                                        <span className={`text-[8px] font-bold uppercase tracking-widest ${paymentPlan === 'full' ? 'text-primary' : 'text-slate-500'}`}>Full Payout</span>
                                        <p className="text-[11px] font-bold text-secondary">₹{grandTotal.toLocaleString()}</p>
                                    </button>
                                    {propertySettings.payAtHotelEnabled && (
                                        <button
                                            onClick={() => setPaymentPlan('partial')}
                                            className={`p-4 rounded-sm border transition-all flex flex-col items-center gap-2 group ${paymentPlan === 'partial' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <Plus size={16} className={paymentPlan === 'partial' ? 'text-amber-600' : 'text-slate-400'} />
                                            <span className={`text-[8px] font-bold uppercase tracking-widest ${paymentPlan === 'partial' ? 'text-amber-700' : 'text-slate-500'}`}>Pay at Hotel</span>
                                            <p className="text-[11px] font-bold text-secondary">₹{depositAmount.toLocaleString()} <span className="text-[8px] text-slate-500">now</span></p>
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                    <span>Accommodation Summary</span>
                                    <span className="text-secondary tabular-nums">₹{totalBase.toLocaleString()}</span>
                                </div>
                                {taxes.map(t => (
                                    <div key={t._id} className="flex justify-between text-[9px] font-bold text-slate-500">
                                        <span className="uppercase tracking-widest">{t.name} ({t.rate}%)</span>
                                        <span className="text-secondary tabular-nums">₹{(totalBase * t.rate / 100).toLocaleString()}</span>
                                    </div>
                                ))}

                                {couponApplied && (
                                    <div className="flex justify-between text-[9px] font-bold text-emerald-600 animate-in slide-in-from-left-2">
                                        <span className="uppercase tracking-widest">Promotional Voucher Applied</span>
                                        <span className="tabular-nums">- ₹{Math.round(discount).toLocaleString()}</span>
                                    </div>
                                )}

                                {/* Coupon Input */}
                                <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                                    <div className="flex flex-col gap-3">
                                        {!couponApplied && publicCoupons.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Available Vouchers</p>
                                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                                    {publicCoupons.map(coupon => (
                                                        <button
                                                            key={coupon._id}
                                                            onClick={() => setCouponCode(coupon.code)}
                                                            className={`flex-shrink-0 px-3 py-2 rounded-sm border-2 border-dashed transition-all flex items-center gap-2 ${couponCode === coupon.code ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                                        >
                                                            <div className="text-[10px] font-black uppercase tracking-tight">{coupon.code}</div>
                                                            <div className="text-[7px] font-bold uppercase py-0.5 px-1.5 bg-slate-100 rounded-sm">
                                                                {coupon.type === 'Percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="relative flex gap-2">
                                            <div className="relative flex-1">
                                                <Ticket size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input
                                                    type="text"
                                                    placeholder="Enter Promotional Code"
                                                    value={couponCode}
                                                    disabled={couponApplied}
                                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-9 pr-4 py-2.5 text-[8px] font-bold uppercase tracking-widest outline-none focus:border-primary disabled:opacity-50"
                                                />
                                            </div>
                                            <button
                                                onClick={couponApplied ? handleRemoveCoupon : handleApplyCoupon}
                                                disabled={!couponApplied && !couponCode}
                                                className={`px-6 rounded-sm text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 transition-all ${couponApplied ? 'bg-rose-500 text-white' : 'bg-primary text-secondary hover:brightness-110'}`}
                                            >
                                                {couponApplied ? 'Remove' : 'Apply'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200 flex flex-col gap-1">
                                    {paymentPlan === 'partial' && (
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Remaining at Check-in</p>
                                            <p className="text-[11px] font-bold text-rose-600">₹{(grandTotal - depositAmount).toLocaleString()}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{paymentPlan === 'full' ? 'Investment' : 'Initial Due'}</p>
                                        <p className={`text-3xl font-bold tracking-tight ${paymentPlan === 'full' ? 'text-emerald-700' : 'text-amber-600'}`}>₹{amountToPayNow.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={handleWalletPayment}
                                    className="bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-secondary/20 hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <CreditCard size={16} /> Wallet (₹{balance.toLocaleString()})
                                </button>
                                <button
                                    onClick={handleRazorpayPayment}
                                    className="bg-white text-secondary border-2 border-slate-100 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                                >
                                    <Zap size={16} className="text-amber-500 group-hover:scale-110 transition-transform" /> Razorpay Secured
                                </button>
                            </div>
                        </div>
                    </div>
                )
                }

                {step === 4 && (
                    <div className="max-w-md mx-auto text-center space-y-6 animate-in zoom-in-95 duration-700">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-sm flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                                <CheckCircle2 size={48} className="animate-in fade-in zoom-in duration-500 delay-200" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-secondary uppercase tracking-tight">Voucher <span className="text-primary italic">active</span></h1>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Stay Reference: {bookingId}</p>
                        </div>

                        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm space-y-4 relative overflow-hidden text-left">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />

                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sanctuary</span>
                                <span className="text-[11px] font-bold text-secondary uppercase tracking-tight">{selectedVariant?.name}</span>
                            </div>
                            {selectedPlan && (
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Meal Plan</span>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">{selectedPlan.planName}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block">Check-In</span>
                                    <span className="text-[10px] font-bold text-secondary">{new Date(dates.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    <span className="text-[6px] text-slate-400 block">After 12:00 PM</span>
                                </div>
                                <div>
                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block">Check-Out</span>
                                    <span className="text-[10px] font-bold text-secondary">{new Date(dates.checkOut || dates.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    <span className="text-[6px] text-slate-400 block">Before 11:00 AM</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block">Occupancy</span>
                                    <span className="text-[10px] font-bold text-secondary">{numRooms} Room{numRooms > 1 ? 's' : ''} · {roomDetails.reduce((s, r) => s + r.adults, 0)}A {roomDetails.reduce((s, r) => s + r.children, 0) > 0 ? `· ${roomDetails.reduce((s, r) => s + r.children, 0)}C` : ''}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block">Duration</span>
                                    <span className="text-[10px] font-bold text-secondary">{nights(dates.checkIn, dates.checkOut)} Night{nights(dates.checkIn, dates.checkOut) > 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Net Valuation</span>
                                <span className="text-[16px] font-bold text-emerald-700 tracking-tight">₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    const loadImg = (src) => new Promise((resolve) => {
                                        const img = new Image();
                                        img.crossOrigin = 'anonymous';
                                        img.onload = () => {
                                            const c = document.createElement('canvas');
                                            c.width = img.naturalWidth; c.height = img.naturalHeight;
                                            c.getContext('2d').drawImage(img, 0, 0);
                                            resolve(c.toDataURL('image/png'));
                                        };
                                        img.onerror = () => resolve(null);
                                        img.src = src;
                                    });

                                    const logoBase64 = await loadImg('/logo.png');
                                    const pdf = new jsPDF('p', 'mm', 'a4');
                                    const w = pdf.internal.pageSize.getWidth();
                                    const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                    const n_stay = nights(dates.checkIn, dates.checkOut);
                                    const totalA = roomDetails.reduce((s, r) => s + r.adults, 0);
                                    const totalC = roomDetails.reduce((s, r) => s + r.children, 0);

                                    pdf.setFillColor(252, 252, 250); pdf.rect(0, 0, w, 297, 'F');
                                    pdf.setFillColor(16, 185, 129); pdf.rect(0, 0, w, 4, 'F');

                                    // Logo
                                    let hY = 15;
                                    if (logoBase64) {
                                        pdf.addImage(logoBase64, 'PNG', (w - 32) / 2, hY, 32, 32);
                                        hY += 37;
                                    }

                                    pdf.setFontSize(24); pdf.setTextColor(15, 23, 42); pdf.text('NowStay', w / 2, hY + 5, { align: 'center' });
                                    pdf.setFontSize(8); pdf.setTextColor(100, 116, 139); pdf.text('INDORE, MADHYA PRADESH  \u00b7  LUXURY SANCTUARY', w / 2, hY + 11, { align: 'center' });
                                    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text('hello@nowstay.com  \u00b7  +91 74071 75567', w / 2, hY + 16, { align: 'center' });

                                    const divY = hY + 22;
                                    pdf.setDrawColor(226, 232, 240); pdf.line(20, divY, w - 20, divY);

                                    const idY = divY + 10;
                                    pdf.setFontSize(9); pdf.setTextColor(16, 185, 129); pdf.text('CONFIRMED STAY VOUCHER', 20, idY);
                                    pdf.setTextColor(148, 163, 184); pdf.setFontSize(8); pdf.text(`Reference ID: ${bookingId}`, w - 20, idY, { align: 'right' });

                                    let y = idY + 8;
                                    pdf.setFillColor(248, 250, 252); pdf.roundedRect(20, y, w - 40, 28, 3, 3, 'F');
                                    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text('SELECTED SANCTUARY', 28, y + 9);
                                    pdf.setFontSize(14); pdf.setTextColor(15, 23, 42); pdf.text(selectedVariant?.name || '---', 28, y + 18);
                                    if (selectedPlan?.planName) { pdf.setFontSize(7); pdf.setTextColor(16, 185, 129); pdf.text(selectedPlan.planName.toUpperCase(), 28, y + 23); }
                                    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text('CATEGORY', w - 28, y + 9, { align: 'right' });
                                    pdf.setFontSize(10); pdf.setTextColor(15, 23, 42); pdf.text(room?.name || 'Sanctuary', w - 28, y + 18, { align: 'right' });

                                    y += 34;
                                    pdf.setFillColor(248, 250, 252);
                                    pdf.roundedRect(20, y, (w - 45) / 2, 32, 3, 3, 'F');
                                    pdf.roundedRect(25 + (w - 45) / 2, y, (w - 45) / 2, 32, 3, 3, 'F');
                                    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text('ARRIVAL (CHECK-IN)', 28, y + 10);
                                    pdf.setFontSize(11); pdf.setTextColor(15, 23, 42); pdf.text(fmt(dates.checkIn), 28, y + 18);
                                    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text('Check-in after 12:00 PM', 28, y + 25);
                                    const rx = 33 + (w - 45) / 2;
                                    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text('DEPARTURE (CHECK-OUT)', rx, y + 10);
                                    pdf.setFontSize(11); pdf.setTextColor(15, 23, 42); pdf.text(fmt(dates.checkOut || dates.checkIn), rx, y + 18);
                                    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text('Check-out before 11:00 AM', rx, y + 25);

                                    y += 40; pdf.setDrawColor(226, 232, 240); pdf.line(20, y, w - 20, y); y += 10;
                                    const cols = [
                                        { label: 'DURATION', value: `${n_stay} Night${n_stay > 1 ? 's' : ''}` },
                                        { label: 'ROOMS', value: `${numRooms} Unit${numRooms > 1 ? 's' : ''}` },
                                        { label: 'GUESTS', value: `${totalA}A${totalC > 0 ? ` \u00b7 ${totalC}C` : ''}` },
                                    ];
                                    const colW = (w - 40) / cols.length;
                                    cols.forEach((col, i) => {
                                        const cx = 20 + colW * i + colW / 2;
                                        pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text(col.label, cx, y, { align: 'center' });
                                        pdf.setFontSize(12); pdf.setTextColor(15, 23, 42); pdf.text(col.value, cx, y + 8, { align: 'center' });
                                    });

                                    y += 18; pdf.setDrawColor(226, 232, 240); pdf.line(20, y, w - 20, y); y += 8;
                                    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text('GUEST POLICIES', 20, y); y += 6;
                                    pdf.setFontSize(8); pdf.setTextColor(100, 116, 139);
                                    const pols = [
                                        '\u00b7 Valid Photo ID Proof (Aadhar/Voter ID) is mandatory for check-in.',
                                        '\u00b7 Management reserves the right of admission.',
                                        '\u00b7 Early check-in or late check-out is subject to availability and extra charges.',
                                        '\u00b7 Please carry a digital or printed copy of this voucher.'
                                    ];
                                    pols.forEach(pLine => { pdf.text(pLine, 25, y); y += 5; });

                                    y = 230;
                                    pdf.setFillColor(15, 23, 42); pdf.roundedRect(20, y, w - 40, 25, 3, 3, 'F');
                                    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.text('TOTAL VALUATION (INCLUSIVE OF TAXES)', 28, y + 9);
                                    pdf.setFontSize(16); pdf.setTextColor(16, 185, 129); pdf.text(`INR ${grandTotal.toLocaleString()}`, 28, y + 18);
                                    pdf.setFontSize(8); pdf.setTextColor(148, 163, 184); pdf.text('OFFICIAL RECEIPT', w - 28, y + 18, { align: 'right' });

                                    y += 35; pdf.setDrawColor(226, 232, 240); pdf.line(20, y, 70, y);
                                    pdf.setFontSize(6); pdf.setTextColor(148, 163, 184); pdf.text('AUTHORISED SIGNATORY', 20, y + 4);

                                    pdf.setFontSize(6);
                                    pdf.text('NowStay \u00b7 Indore \u00b7 Madhya Pradesh 452001', w / 2, 280, { align: 'center' });
                                    pdf.text(`Digitally Generated on ${new Date().toLocaleString()}`, w / 2, 284, { align: 'center' });
                                    pdf.save(`NowStay_Voucher_${bookingId}.pdf`);
                                }}
                                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Download size={16} /> Download Voucher
                            </button>
                            <button onClick={() => navigate('/profile/bookings')} className="flex-1 bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-secondary/20 hover:bg-primary transition-all active:scale-95">
                                My Bookings
                            </button>
                        </div>

                    </div>
                )
                }
            </div >

            {
                isModalOpen && selectedPlan && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-[340px] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="bg-slate-50 px-8 py-5 flex items-center justify-between border-b border-slate-100">
                                <div>
                                    <p className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mb-0.5">Configuration</p>
                                    <h2 className="text-secondary text-base font-serif lowercase italic">Guest <span className="text-primary italic">Distribution.</span></h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-secondary transition-all">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Sanctuary Units</span>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setNumRooms(Math.max(1, numRooms - 1))}
                                            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-secondary hover:border-primary/30 transition-all active:scale-90"
                                        ><ChevronLeft size={16} /></button>
                                        <span className="font-black text-lg w-6 text-center tabular-nums">{numRooms}</span>
                                        <button
                                            onClick={() => setNumRooms(Math.min(availableCount, numRooms + 1))}
                                            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-secondary hover:border-primary/30 transition-all active:scale-90"
                                        ><ChevronRight size={16} /></button>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                    {roomDetails.map((details, index) => (
                                        <div key={index} className="p-5 rounded-[2rem] border border-slate-100 bg-white shadow-sm space-y-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-primary rounded-full" />
                                                <span className="text-[8px] font-black text-secondary uppercase tracking-[0.2em]">Sanctuary No. {index + 1}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block ml-1">Adults</label>
                                                    <div className="relative">
                                                        <select
                                                            value={details.adults}
                                                            onChange={e => {
                                                                const copy = [...roomDetails];
                                                                copy[index].adults = parseInt(e.target.value);
                                                                setRoomDetails(copy);
                                                            }}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-black text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                                                        >
                                                            <option value="1">1 Adult @ ₹{pricingMeta?.adult1 || 0}</option>
                                                            <option value="2">2 Adults @ ₹{pricingMeta?.adult2 || 0}</option>
                                                            <option value="3">3 Adults (Incl. Extra) @ ₹{(pricingMeta?.adult2 || 0) + (pricingMeta?.extraAdult || 0)}</option>
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block ml-1">Children</label>
                                                    <div className="relative">
                                                        <select
                                                            value={details.children}
                                                            onChange={e => {
                                                                const copy = [...roomDetails];
                                                                copy[index].children = parseInt(e.target.value);
                                                                setRoomDetails(copy);
                                                            }}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-black text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                                                        >
                                                            <option value="0">0 Child</option>
                                                            <option value="1">1 Child @ ₹{pricingMeta?.child || 0}</option>
                                                            <option value="2">2 Kids @ ₹{(pricingMeta?.child || 0) * 2}</option>
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 flex flex-col gap-4 border-t border-slate-100">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Valuation</span>
                                    <p className="text-2xl font-black text-secondary tracking-tighter italic">₹{totalBase.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => { setIsModalOpen(false); setStep(3); }}
                                    className="w-full bg-secondary hover:bg-primary text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-secondary/20"
                                >
                                    Continue to Confirmation
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};


export default BookingFlow;
