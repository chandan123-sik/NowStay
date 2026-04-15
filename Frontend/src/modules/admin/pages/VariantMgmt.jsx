import { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import { Plus, Edit2, Trash2, X, ChevronDown, Layers, Upload } from 'lucide-react';
import { getAmenityIcon, commonAmenityNames } from '../../../utils/amenityIcons';

const EMPTY_FORM = { roomType: '', name: '', totalRooms: '', images: '', amenities: '', isActive: true };

const VariantMgmt = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        setUploading(true);

        try {
            const { data } = await api.post('/media/upload-single', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const current = formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [];
            setFormData({ ...formData, images: [...current, data.imageUrl].join(', ') });
        } catch (error) {
            const detail = error.response?.data?.details || error.response?.data?.message || 'Check your internet or file format';
            alert(`Upload Failed: ${detail}`);
        } finally {
            setUploading(false);
        }
    };
    const [filterType, setFilterType] = useState('');

    const fetchData = async () => {
        try {
            const roomsRes = await api.get('/rooms');
            setRoomTypes(roomsRes.data);
            const all = await Promise.all(roomsRes.data.map(rt => api.get(`/rooms/variants/${rt._id}`)));
            const flat = all.flatMap((r, i) => r.data.map(v => ({ ...v, roomTypeObj: roomsRes.data[i] })));
            setVariants(flat);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setEditingVariant(null);
        setFormData(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEdit = (v) => {
        setEditingVariant(v);
        setFormData({
            roomType: v.roomType?._id || v.roomType || '',
            name: v.name,
            totalRooms: v.totalRooms,
            images: v.images?.join(', ') || '',
            amenities: v.amenities?.join(', ') || '',
            isActive: v.isActive
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            totalRooms: parseInt(formData.totalRooms) || 0,
            images: formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [],
            amenities: formData.amenities ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean) : []
        };
        try {
            if (editingVariant) {
                await api.put(`/rooms/variants/${editingVariant._id}`, payload);
            } else {
                await api.post('/rooms/variants', payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Operation failed. Check all fields.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this variant? All its pricing plans will be affected.')) return;
        try {
            await api.delete(`/rooms/variants/${id}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const filtered = filterType ? variants.filter(v => (v.roomType?._id || v.roomType) === filterType) : variants;

    if (loading) return <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">
                        Room <span className="text-primary italic">Variants</span>
                    </h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight">
                        Define Standard & View Facing variants per room type · {variants.length} variants
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="w-full sm:w-auto bg-secondary text-white px-6 lg:px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] lg:text-[10px] shadow-xl hover:shadow-secondary/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" /> New Variant
                </button>
            </header>

            {/* Filter by Room Type */}
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50 w-fit">
                <label className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Filter:</label>
                <div className="relative">
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="pl-3 pr-8 py-2 bg-white border border-slate-100 rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer"
                    >
                        <option value="">All Types</option>
                        {roomTypes.map(rt => <option key={rt._id} value={rt._id}>{rt.name}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Variants Grid */}
            {filtered.length === 0 ? (
                <div className="py-24 text-center text-slate-300">
                    <Layers size={40} className="mx-auto mb-4 opacity-40" />
                    <p className="font-bold uppercase tracking-widest text-[10px]">No variants configured yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                    {filtered.map(v => (
                        <div key={v._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
                            {v.images?.[0] && (
                                <div className="h-40 lg:h-48 overflow-hidden relative">
                                    <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest bg-secondary/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                            {v.roomTypeObj?.name || '—'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="p-5 lg:p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0 flex-1">
                                        {!v.images?.[0] && (
                                            <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full">
                                                {v.roomTypeObj?.name || '—'}
                                            </span>
                                        )}
                                        <h3 className="text-base lg:text-lg font-bold text-secondary mt-1 truncate">{v.name}</h3>
                                    </div>
                                    <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ml-4">
                                        <button onClick={() => openEdit(v)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-primary transition-colors hover:bg-white hover:shadow-sm"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(v._id)} className="p-2 bg-rose-50 text-rose-400 rounded-xl hover:text-rose-600 transition-colors hover:bg-white hover:shadow-sm"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5 bg-slate-50/50 px-3 py-2 rounded-xl">
                                        <Layers size={12} className="text-primary" />
                                        <p className="text-sm font-black text-secondary tabular-nums">{v.availableRooms ?? v.totalRooms}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Availability</p>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${v.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                        {v.isActive ? 'Active' : 'Halted'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-xl rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 relative z-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 lg:right-8 lg:top-8 text-slate-400 hover:text-secondary p-2 bg-slate-50 rounded-lg lg:bg-transparent">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize mb-6 lg:mb-8 pr-12">
                            {editingVariant ? 'Refine' : 'Architect'} <span className="text-primary italic">Variant</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Room Type */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Room Type</label>
                                <div className="relative">
                                    <select required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none appearance-none"
                                        value={formData.roomType}
                                        onChange={e => setFormData(f => ({ ...f, roomType: e.target.value }))}
                                    >
                                        <option value="">Select room type...</option>
                                        {roomTypes.map(rt => <option key={rt._id} value={rt._id}>{rt.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Variant Name */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Variant Name</label>
                                <input required placeholder="Standard / View Facing"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none"
                                    value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                            </div>

                            {/* Total Rooms */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Availability <span className="text-rose-500">*</span></label>
                                <input type="number" required min="1"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold font-mono outline-none"
                                    value={formData.totalRooms} onChange={e => setFormData(f => ({ ...f, totalRooms: e.target.value }))} />
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gallery Management</label>
                                <div className="flex flex-wrap gap-4">
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={uploading}
                                        className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-slate-50 transition-all text-slate-400 group"
                                    >
                                        <Upload size={18} className={uploading ? 'animate-bounce text-primary' : 'group-hover:text-primary transition-colors'} />
                                        <span className="text-[7px] font-black uppercase tracking-widest">{uploading ? '...' : 'Upload'}</span>
                                    </button>

                                    {formData.images.split(',').filter(Boolean).map((url, i) => (
                                        <div key={url} className="w-20 h-20 rounded-2xl relative group overflow-hidden border border-slate-100 shadow-sm">
                                            <img src={url.trim()} className="w-full h-full object-cover" alt="" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const remaining = formData.images.split(',').map(s => s.trim()).filter((_, index) => index !== i);
                                                    setFormData({ ...formData, images: remaining.join(', ') });
                                                }}
                                                className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Extra Amenities</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none appearance-none"
                                        onChange={e => {
                                            if (!e.target.value) return;
                                            const current = formData.amenities ? formData.amenities.split(',').map(s => s.trim()) : [];
                                            if (!current.includes(e.target.value)) {
                                                const newVal = current.length > 0 ? [...current, e.target.value].join(', ') : e.target.value;
                                                setFormData({ ...formData, amenities: newVal });
                                            }
                                            e.target.value = "";
                                        }}
                                    >
                                        <option value="">+ Add Special Icon...</option>
                                        {commonAmenityNames.sort().map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Plus size={16} /></div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2 px-1">
                                    {formData.amenities.split(',').filter(Boolean).map((a, i) => {
                                        const clean = a.trim();
                                        const Icon = getAmenityIcon(clean);
                                        return (
                                            <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                                                <Icon size={12} className="text-primary" />
                                                <span className="text-[9px] font-bold text-secondary uppercase whitespace-nowrap">{clean}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const remaining = formData.amenities.split(',').map(s => s.trim()).filter(x => x !== clean);
                                                        setFormData({ ...formData, amenities: remaining.join(', ') });
                                                    }}
                                                    className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-primary" />
                                <label htmlFor="isActive" className="text-xs font-bold text-secondary cursor-pointer">Active (visible to guests)</label>
                            </div>

                            <button type="submit"
                                className="w-full bg-primary text-secondary py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all hover:brightness-110">
                                {editingVariant ? 'Update Variant' : 'Create Variant'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantMgmt;
