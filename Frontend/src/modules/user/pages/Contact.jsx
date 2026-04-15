import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Phone, Mail, Send, Clock, CheckCircle2, Instagram, Facebook, Youtube, ExternalLink, X } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const contactInfo = [
    {
        icon: MapPin, label: 'Location',
        lines: ['New Digha, West Bengal - 721428'],
        action: { text: 'View on Maps', href: 'https://goo.gl/maps/Yrsjyiv6ivuG2Hko7' },
        color: 'text-rose-500 bg-rose-50'
    },
    {
        icon: Phone, label: 'Call Us',
        lines: ['+91 74071 75567'],
        action: { text: 'WhatsApp Us', href: 'https://wa.me/917407175567' },
        color: 'text-emerald-500 bg-emerald-50'
    },
    {
        icon: Mail, label: 'Email',
        lines: ['hello@ananyahotel.com'],
        color: 'text-blue-500 bg-blue-50'
    },
    {
        icon: Clock, label: 'Hours',
        lines: ['Reception: Open 24/7', 'Check-in: 12:00 PM | Out: 11:00 AM'],
        color: 'text-amber-500 bg-amber-50'
    },
];

const SUBJECTS = ['Room Booking Inquiry', 'Restaurant Reservation', 'Special Event / Wedding', 'Spa Appointment', 'General Support', 'Feedback'];

const Contact = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 10);
        return () => clearTimeout(timer);
    }, [location.key]);

    const [form, setForm] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone: user?.mobile || '',
        subject: location.state?.subject || SUBJECTS[0],
        message: ''
    });

    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                email: user.email || '',
                phone: user.mobile || ''
            }));
        }
    }, [user]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.phone.length !== 10) return alert("Mobile number must be exactly 10 digits");
        setLoading(true);
        try {
            await api.post('/messages', {
                ...form,
                userId: user?._id
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Submit Error:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (f, v) => {
        if (f === 'phone') {
            const numericValue = v.replace(/[^0-9]/g, '').slice(0, 10);
            setForm(prev => ({ ...prev, [f]: numericValue }));
            return;
        }
        if (f === 'firstName' || f === 'lastName') {
            const alphaValue = v.replace(/[^a-zA-Z\s]/g, '');
            setForm(prev => ({ ...prev, [f]: alphaValue }));
            return;
        }
        setForm(prev => ({ ...prev, [f]: v }));
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-6 md:pb-10 animate-in slide-in-from-top-full duration-700 ease-out">
            {/* Dark Hero Header */}
            <div className="relative bg-secondary overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, #c9a84c 0%, transparent 40%), radial-gradient(circle at 90% 10%, #c9a84c 0%, transparent 40%)' }} />

                {/* Close Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 right-6 z-20 p-2 bg-white/5 text-white/40 hover:text-white rounded-full transition-colors active:scale-90"
                >
                    <X size={20} />
                </button>

                <div className="relative z-10 px-6 pt-8 pb-1">
                    <span className="text-primary text-[8px] font-black uppercase tracking-[0.5em]">We're Here</span>
                    <h1 className="text-3xl font-serif text-white mt-2 lowercase leading-tight">
                        Get in <span className="text-primary italic">Touch.</span>
                    </h1>
                    <p className="text-white/50 text-xs mt-3 font-medium leading-relaxed max-w-sm">
                        Our guest relations team is ready to help you plan your perfect getaway — 24 hours a day, 7 days a week.
                    </p>
                </div>
            </div>

            <div className="px-4 max-w-3xl mx-auto space-y-4">
                {/* Contact Info Cards Grid */}
                <div className="grid grid-cols-2 gap-3 -mt-1">
                    {contactInfo.map(({ icon: Icon, label, lines, action, color }) => (
                        <div key={label} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 space-y-3">
                            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                {lines.map(l => <p key={l} className="text-secondary text-xs font-medium mt-0.5">{l}</p>)}
                                {action && (
                                    <a href={action.href} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-primary text-[9px] font-black uppercase tracking-widest mt-2 hover:underline">
                                        {action.text} <ExternalLink size={9} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-secondary px-6 py-5">
                        <p className="text-primary text-[8px] font-black uppercase tracking-[0.4em]">Send a Message</p>
                        <h2 className="text-white font-serif text-lg mt-0.5">We'll respond within 24 hrs</h2>
                    </div>

                    <div className="p-6">
                        {submitted ? (
                            <div className="py-10 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={32} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-secondary font-serif text-xl">Message Sent!</h3>
                                    <p className="text-slate-400 text-sm mt-2">Thank you, <strong>{form.firstName}</strong>. Our team will reach out to you shortly.</p>
                                </div>
                                <button onClick={() => { setSubmitted(false); setForm({ firstName: '', lastName: '', email: '', phone: '', subject: SUBJECTS[0], message: '' }); }}
                                    className="px-6 py-3 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { field: 'firstName', label: 'First Name', placeholder: 'Aryan' },
                                        { field: 'lastName', label: 'Last Name', placeholder: 'Pathak' },
                                    ].map(({ field, label, placeholder }) => (
                                        <div key={field} className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                                            <input type="text" required value={form[field]}
                                                onChange={e => handleChange(field, e.target.value)}
                                                placeholder={placeholder}
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-3 py-3 rounded-xl outline-none transition-all text-secondary font-medium"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                        <input type="email" required value={form.email}
                                            onChange={e => handleChange('email', e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-3 py-3 rounded-xl outline-none transition-all text-secondary font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                                        <input type="tel" value={form.phone}
                                            onChange={e => handleChange('phone', e.target.value)}
                                            placeholder="10-digit number"
                                            maxLength={10}
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-3 py-3 rounded-xl outline-none transition-all text-secondary font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
                                    <select value={form.subject}
                                        onChange={e => handleChange('subject', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-3 py-3 rounded-xl outline-none transition-all text-secondary font-medium appearance-none cursor-pointer">
                                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Message */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Message</label>
                                    <textarea rows={4} required value={form.message}
                                        onChange={e => handleChange('message', e.target.value)}
                                        placeholder="Tell us how we can help you..."
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white text-sm px-3 py-3 rounded-xl outline-none transition-all text-secondary font-medium resize-none"
                                    />
                                </div>

                                <button type="submit" disabled={loading}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all
                                        ${loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-secondary text-white shadow-xl shadow-secondary/20 hover:bg-primary active:scale-95'}`}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </span>
                                    ) : (
                                        <><Send size={16} /> Send Message</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Map */}
                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-56">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3701.3533230635465!2d87.5029377!3d21.6214309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0327f2c8d23d8b%3A0x47e812d8a0c23945!2sAnanya%20Hotel!5e0!3m2!1sen!2sin!4v1657891234567"
                        className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                        allowFullScreen loading="lazy"
                    />
                </div>

                {/* Social Links */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest">Follow Us</p>
                        <p className="text-secondary font-bold text-sm mt-0.5">Stay connected with Ananya</p>
                    </div>
                    <div className="flex gap-3">
                        {[
                            { icon: Instagram, href: 'https://www.instagram.com/ananyahotelnewdigha?igsh=MThtOHBwdzh0cXd6MA==' },
                            { icon: Facebook, href: 'https://www.facebook.com/share/18MzGLcKVr/' },
                            { icon: Youtube, href: '#' }
                        ].map(({ icon: Icon, href }, i) => (
                            <a key={i} href={href} target="_blank" rel="noreferrer"
                                className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-90">
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

