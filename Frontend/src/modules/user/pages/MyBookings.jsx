import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Calendar, MapPin, ChevronLeft, Tag, CheckCircle2, Clock, BedDouble, Phone, X, AlertTriangle, Coffee, Download } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { jsPDF } from 'jspdf';

const STATUS_CONFIG = {
    Confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', icon: CheckCircle2 },
    Completed: { color: 'bg-slate-50 text-slate-500 border-slate-100', dot: 'bg-slate-400', icon: CheckCircle2 },
    Cancelled: { color: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500', icon: X },
    Pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', icon: Clock },
};

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];



const BookingCard = ({ booking, onManage }) => {
    const status = (booking.bookingStatus || 'pending').charAt(0).toUpperCase() + (booking.bookingStatus || 'pending').slice(1);
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
    const Icon = cfg.icon;

    const ci = new Date(booking.checkIn);
    const co = new Date(booking.checkOut);
    const nightsStay = Math.max(1, Math.ceil((co - ci) / (1000 * 60 * 60 * 24)));
    const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
            {/* Image Strip */}
            <div className="relative h-32 overflow-hidden">
                <img src={booking.variant?.images?.[0] || booking.roomType?.images?.[0] || '/hero-luxury.jpg'} alt={booking.variant?.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />

                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest backdrop-blur-md ${cfg.color}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                    {status}
                </div>

                <div className="absolute bottom-3 left-3">
                    <p className="text-primary text-[8px] font-bold uppercase tracking-[0.3em] mb-1">{booking.roomType?.name}</p>
                    <h3 className="text-white font-serif text-sm tracking-tight">{booking.variant?.name}</h3>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Tag size={10} className="text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-widest">#{booking.bookingId}</span>
                    </div>
                    {booking.plan && (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            <Coffee size={10} className="text-primary" />
                            <span className="text-[8px] font-bold text-secondary uppercase tracking-tighter">
                                {booking.plan.ratePlan?.code ? `${booking.plan.ratePlan.code} - ` : ''}{booking.plan.planName}
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Arrival', value: fmt(booking.checkIn) },
                        { label: 'Departure', value: fmt(booking.checkOut) },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
                            <p className="text-secondary text-[10px] font-bold">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div>
                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                            {nightsStay} Night{nightsStay > 1 ? 's' : ''} · {booking.roomsCount} Unit{booking.roomsCount > 1 ? 's' : ''} · {booking.roomDetails?.reduce((s, r) => s + r.adults, 0)}A {booking.roomDetails?.reduce((s, r) => s + r.children, 0) > 0 ? `· ${booking.roomDetails?.reduce((s, r) => s + r.children, 0)}C` : ''}
                        </p>
                        <p className="text-emerald-600 font-mono font-black text-lg tracking-tighter">₹{booking.totalPrice.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={() => onManage(booking)}
                        className="px-5 py-2.5 bg-secondary text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all shadow-lg shadow-secondary/20 hover:bg-slate-800"
                    >
                        Manage
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper: load image as base64
const loadImageAsBase64 = (src) => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
});

// Native jsPDF voucher generator with logo — no html2canvas (avoids oklch color bug)
const generateVoucherPDF = async (booking) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const ci = new Date(booking.checkIn);
    const co = new Date(booking.checkOut);
    const nightsStay = Math.max(1, Math.ceil((co - ci) / 86400000));
    const totalAdults = booking.roomDetails?.reduce((s, r) => s + r.adults, 0) || 2;
    const totalChildren = booking.roomDetails?.reduce((s, r) => s + r.children, 0) || 0;

    // Load logo
    const logoBase64 = await loadImageAsBase64('/logo.png');

    // Background
    pdf.setFillColor(252, 252, 250);
    pdf.rect(0, 0, w, 297, 'F');

    // Top accent bar
    pdf.setFillColor(16, 185, 129);
    pdf.rect(0, 0, w, 4, 'F');

    // Logo
    let headerY = 15;
    if (logoBase64) {
        const sz = 32;
        pdf.addImage(logoBase64, 'PNG', (w - sz) / 2, headerY, sz, sz);
        headerY += sz + 5;
    }

    // Header Branding
    pdf.setFontSize(24);
    pdf.setTextColor(15, 23, 42);
    pdf.text('NowStay', w / 2, headerY + 5, { align: 'center' });

    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('INDORE, MADHYA PRADESH  \u00b7  LUXURY SANCTUARY', w / 2, headerY + 11, { align: 'center' });

    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('hello@nowstay.com  \u00b7  +91 74071 75567', w / 2, headerY + 16, { align: 'center' });

    // Status / Reference
    const divY = headerY + 22;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(20, divY, w - 20, divY);

    const idY = divY + 10;
    pdf.setFontSize(9);
    pdf.setTextColor(16, 185, 129);
    pdf.text('CONFIRMED STAY VOUCHER', 20, idY);
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(8);
    pdf.text(`Reference ID: ${booking.bookingId}`, w - 20, idY, { align: 'right' });

    // Sanctuary Info Box
    let y = idY + 8;
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(20, y, w - 40, 28, 3, 3, 'F');

    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('SELECTED SANCTUARY', 28, y + 9);

    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42);
    pdf.text(booking.variant?.name || booking.roomType?.name || 'Luxury Suite', 28, y + 18);

    if (booking.plan?.planName) {
        pdf.setFontSize(7);
        pdf.setTextColor(16, 185, 129);
        pdf.text(booking.plan.planName.toUpperCase(), 28, y + 23);
    }

    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('CATEGORY', w - 28, y + 9, { align: 'right' });

    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text(booking.roomType?.name || 'Sanctuary', w - 28, y + 18, { align: 'right' });

    // Timeline section
    y += 34;
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(20, y, (w - 45) / 2, 32, 3, 3, 'F');
    pdf.roundedRect(25 + (w - 45) / 2, y, (w - 45) / 2, 32, 3, 3, 'F');

    // Arrival
    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
    pdf.text('ARRIVAL (CHECK-IN)', 28, y + 10);
    pdf.setFontSize(11); pdf.setTextColor(15, 23, 42);
    pdf.text(fmt(booking.checkIn), 28, y + 18);
    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
    pdf.text('Check-in after 12:00 PM', 28, y + 25);

    // Departure
    const rx = 33 + (w - 45) / 2;
    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
    pdf.text('DEPARTURE (CHECK-OUT)', rx, y + 10);
    pdf.setFontSize(11); pdf.setTextColor(15, 23, 42);
    pdf.text(fmt(booking.checkOut), rx, y + 18);
    pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
    pdf.text('Check-out before 11:00 AM', rx, y + 25);

    // Metrics Row
    y += 40;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(20, y, w - 20, y);
    y += 10;

    const cols = [
        { label: 'DURATION', value: `${nightsStay} Night${nightsStay > 1 ? 's' : ''}` },
        { label: 'ROOMS', value: `${booking.roomsCount || 1} Unit${(booking.roomsCount || 1) > 1 ? 's' : ''}` },
        { label: 'GUESTS', value: `${totalAdults}A${totalChildren > 0 ? ` · ${totalChildren}C` : ''}` },
    ];

    const colWidth = (w - 40) / cols.length;
    cols.forEach((col, i) => {
        const cx = 20 + colWidth * i + colWidth / 2;
        pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
        pdf.text(col.label, cx, y, { align: 'center' });
        pdf.setFontSize(12); pdf.setTextColor(15, 23, 42);
        pdf.text(col.value, cx, y + 8, { align: 'center' });
    });

    // Policies & Security Box
    y += 18;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(20, y, w - 20, y);
    y += 8;

    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('GUEST POLICIES', 20, y);
    y += 6;

    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    const policies = [
        '\u00b7 Valid Photo ID Proof (Aadhar/Voter ID) is mandatory for check-in.',
        '\u00b7 Management reserves the right of admission.',
        '\u00b7 Early check-in or late check-out is subject to availability and extra charges.',
        '\u00b7 Please carry a digital or printed copy of this voucher.'
    ];
    policies.forEach(pLine => {
        pdf.text(pLine, 25, y);
        y += 5;
    });

    // Final Valuation
    y = 230;
    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(20, y, w - 40, 25, 3, 3, 'F');

    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('TOTAL VALUATION (INCLUSIVE OF TAXES)', 28, y + 9);

    pdf.setFontSize(16);
    pdf.setTextColor(16, 185, 129);
    pdf.text(`INR ${booking.totalPrice?.toLocaleString()}`, 28, y + 18);

    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('OFFICIAL RECEIPT', w - 28, y + 18, { align: 'right' });

    // Signature Area
    y += 35;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(20, y, 70, y);
    pdf.setFontSize(6);
    pdf.setTextColor(148, 163, 184);
    pdf.text('AUTHORISED SIGNATORY', 20, y + 4);

    // Footer
    pdf.setFontSize(6);
    pdf.text('NowStay \u00b7 Indore \u00b7 Madhya Pradesh 452001', w / 2, 280, { align: 'center' });
    pdf.text(`Digitally Generated on ${new Date().toLocaleString()}`, w / 2, 284, { align: 'center' });

    pdf.save(`NowStay_Voucher_${booking.bookingId}.pdf`);
};

const MyBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const fetchBookings = async () => {
        if (!user) return;
        try {
            const { data } = await api.get(`/bookings/my/${user._id}`);
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user]);

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
        setIsUpdating(true);
        try {
            await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
            await fetchBookings();
            setSelectedBooking(null);
        } catch (error) {
            alert('Error cancelling booking. Please contact support.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!user) { navigate('/login'); return null; }
    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const filtered = activeTab === 'All' ? bookings : bookings.filter(b => {
        const s = (b.bookingStatus || 'pending').toLowerCase();
        const checkInDate = new Date(b.checkIn);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeTab === 'Upcoming') {
            // Must be confirmed or pending AND check-in date must be today or in the future
            return (s === 'confirmed' || s === 'pending') && checkInDate >= today;
        }
        if (activeTab === 'Completed') return s === 'completed' || (s === 'confirmed' && checkInDate < today);
        return s === activeTab.toLowerCase();
    });

    // Special sort for Upcoming: Closest check-in first. Others: Newest creation first.
    if (activeTab === 'Upcoming') {
        filtered.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-6 md:pb-10 relative">
            {/* Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-secondary/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                            <div>
                                <p className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mb-0.5">Reservation Archive</p>
                                <h3 className="font-serif italic text-base text-secondary lowercase">Booking Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-secondary transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <img
                                    src={selectedBooking.variant?.images?.[0] || '/hero-luxury.jpg'}
                                    className="w-16 h-16 object-cover rounded-xl"
                                />
                                <div>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">{selectedBooking.roomType?.name}</p>
                                    <h4 className="font-serif italic text-sm text-secondary leading-tight">{selectedBooking.variant?.name}</h4>
                                    <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[6px] font-black uppercase tracking-widest ${STATUS_CONFIG[selectedBooking.bookingStatus.charAt(0).toUpperCase() + selectedBooking.bookingStatus.slice(1)]?.color}`}>
                                        {selectedBooking.bookingStatus}
                                    </div>
                                </div>
                            </div>

                            {/* Booking ID & Plan */}
                            <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                <div className="flex items-center gap-2">
                                    <Tag size={12} className="text-emerald-600" />
                                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">#{selectedBooking.bookingId}</span>
                                </div>
                                {selectedBooking.plan && (
                                    <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                                        {selectedBooking.plan.planName}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded-xl border border-slate-50 shadow-sm">
                                        <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Check In</p>
                                        <p className="text-secondary font-bold text-xs">{new Date(selectedBooking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        <p className="text-[6px] text-slate-300 mt-0.5">After 12:00 PM</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-50 shadow-sm">
                                        <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Check Out</p>
                                        <p className="text-secondary font-bold text-xs">{new Date(selectedBooking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        <p className="text-[6px] text-slate-300 mt-0.5">Before 11:00 AM</p>
                                    </div>
                                </div>
                                <div className="bg-secondary p-4 rounded-xl text-white flex flex-col justify-between">
                                    <p className="text-[7px] font-black text-white/50 uppercase">Total Amount</p>
                                    <div>
                                        <p className="text-xl font-black font-mono tracking-tighter text-primary">₹{selectedBooking.totalPrice.toLocaleString()}</p>
                                        <p className="text-[6px] text-white/30 uppercase mt-0.5">Inclusive of Taxes</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stay Duration & Guest Summary */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Duration', value: `${Math.max(1, Math.ceil((new Date(selectedBooking.checkOut) - new Date(selectedBooking.checkIn)) / 86400000))} Night${Math.max(1, Math.ceil((new Date(selectedBooking.checkOut) - new Date(selectedBooking.checkIn)) / 86400000)) > 1 ? 's' : ''}` },
                                    { label: 'Rooms', value: `${selectedBooking.roomsCount || 1} Unit${(selectedBooking.roomsCount || 1) > 1 ? 's' : ''}` },
                                    { label: 'Guests', value: `${selectedBooking.roomDetails?.reduce((s, r) => s + r.adults, 0) || 0}A ${selectedBooking.roomDetails?.reduce((s, r) => s + r.children, 0) > 0 ? `· ${selectedBooking.roomDetails?.reduce((s, r) => s + r.children, 0)}C` : ''}` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                                        <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                        <p className="text-[10px] font-black text-secondary mt-1">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <h5 className="text-[8px] font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                    <BedDouble size={12} className="text-primary" /> Multi-Unit Breakdown
                                </h5>
                                {selectedBooking.roomDetails?.map((room, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-[8px] font-bold text-slate-600">Unit {idx + 1} Configuration</span>
                                        <span className="text-[8px] font-black text-secondary uppercase italic">{room.adults} Adults · {room.children} Children</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-black uppercase text-[9px] tracking-widest rounded-xl active:scale-95 transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={async () => { setDownloading(true); try { await generateVoucherPDF(selectedBooking); } catch (e) { console.error(e); } finally { setDownloading(false); } }}
                                    disabled={downloading}
                                    className="flex-1 py-3 bg-emerald-600 text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    <Download size={14} /> {downloading ? 'Creating...' : 'Download PDF'}
                                </button>
                            </div>
                            {(selectedBooking.bookingStatus === 'pending' || selectedBooking.bookingStatus === 'confirmed') && (
                                <button
                                    onClick={() => handleCancel(selectedBooking._id)}
                                    disabled={isUpdating}
                                    className="w-full py-3 bg-red-50 text-red-500 border border-red-100 font-black uppercase text-[9px] tracking-widest rounded-xl active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isUpdating ? 'Modifying...' : 'Cancel Reservation'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-slate-50/50 px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
                <button onClick={() => navigate('/profile')}
                    className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 active:scale-90 transition-all hover:text-secondary">
                    <ChevronLeft size={16} />
                </button>
                <div>
                    <p className="text-[7px] font-bold text-primary uppercase tracking-[0.4em]">Reservation History</p>
                    <h1 className="text-xs font-bold text-secondary uppercase tracking-widest">My Bookings</h1>
                </div>
                <div className="ml-auto bg-primary/5 text-primary px-2.5 py-1.5 rounded-lg border border-primary/10">
                    <span className="text-[8px] font-bold uppercase tracking-widest">{bookings.length} Total</span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Confirmed', count: bookings.filter(b => b.bookingStatus === 'confirmed').length, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                        { label: 'Completed', count: bookings.filter(b => b.bookingStatus === 'completed').length, color: 'text-slate-500 bg-slate-50 border-slate-100' },
                        { label: 'Cancelled', count: bookings.filter(b => b.bookingStatus === 'cancelled').length, color: 'text-red-500 bg-red-50 border-red-100' },
                    ].map(({ label, count, color }) => (
                        <div key={label} className={`py-4 px-2 rounded-2xl border text-center ${color} shadow-sm`}>
                            <p className="text-xl font-black font-mono tracking-tighter">{count}</p>
                            <p className="text-[7px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95
                                ${activeTab === tab ? 'bg-secondary text-white' : 'bg-white border border-slate-200 text-slate-400 hover:border-primary/30'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Booking Cards */}
                {filtered.length > 0 ? (
                    <div className="space-y-4">
                        {filtered.map(b => <BookingCard key={b._id} booking={b} onManage={setSelectedBooking} />)}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-2">
                        <BedDouble size={32} className="text-slate-200 mx-auto" />
                        <p className="text-secondary font-serif text-base">No bookings found</p>
                        <p className="text-slate-400 text-[10px] font-medium tracking-tight">Your recent stays and history will appear here.</p>
                        <button onClick={() => navigate('/rooms')}
                            className="mt-4 px-6 py-2.5 bg-secondary text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-primary transition-all active:scale-95">
                            Browse Rooms
                        </button>
                    </div>
                )}

                {/* Support banner */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-white text-primary rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100">
                        <Phone size={16} />
                    </div>
                    <div className="flex-1">
                        <p className="text-secondary font-bold text-xs">Help & Support</p>
                        <p className="text-slate-400 text-[9px] mt-0.5">24/7 priority assistance for all guests.</p>
                    </div>
                    <button onClick={() => navigate('/contact')}
                        className="px-4 py-2 bg-secondary text-white text-[8px] font-bold uppercase tracking-widest rounded-lg active:scale-90 transition-all hover:bg-primary">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;

