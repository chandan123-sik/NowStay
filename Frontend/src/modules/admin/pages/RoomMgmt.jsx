import { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import { Search, Plus, Trash2, Edit2, Layers, X, Home, Info, Image as ImageIcon, ChevronRight, Upload } from 'lucide-react';
import { getAmenityIcon, commonAmenityNames } from '../../../utils/amenityIcons';
import { toast } from 'react-hot-toast';

const RoomMgmt = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
    const [editingType, setEditingType] = useState(null);

    const [formData, setFormData] = useState({
        name: '', size: '', capacity: '', bedType: '', totalRooms: 10, amenities: '', images: ''
    });

    const fetchRoomTypes = async () => {
        try {
            const { data } = await api.get('/rooms');
            setRoomTypes(data);
        } catch (error) {
            console.error('Error fetching room types:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRoomTypes(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Extract and clean sequences
        const imageList = formData.images.split(',').map(s => s.trim()).filter(Boolean);
        const amenityList = formData.amenities.split(',').map(s => s.trim()).filter(Boolean);

        if (imageList.length === 0) {
            toast.error('Hero visual asset is mandatory for integration.');
            return;
        }

        const payload = {
            ...formData,
            amenities: amenityList,
            images: imageList
        };

        try {
            if (editingType) {
                await api.put(`/rooms/${editingType._id}`, payload);
            } else {
                await api.post('/rooms', payload);
            }
            setIsModalOpen(false);
            setEditingType(null);
            setFormData({ name: '', size: '', capacity: '', bedType: '', totalRooms: 10, amenities: '', images: '' });
            fetchRoomTypes();
            toast.success('Category successfully synchronized with registry.');
        } catch (error) {
            toast.error('Integration failure detected.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this room type and all its configurations?')) return;
        try {
            await api.delete(`/rooms/${id}`);
            fetchRoomTypes();
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-6 lg:space-y-10 animate-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Room <span className="text-primary italic">Architecture</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight">Define high-level room categories and their physical specifications.</p>
                </div>
                <button
                    onClick={() => { setEditingType(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-secondary text-white px-6 lg:px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] lg:text-[10px] shadow-xl hover:shadow-secondary/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" /> New Category
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                {roomTypes.map(type => (
                    <div key={type._id} className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-5 lg:p-8 border border-slate-100 shadow-sm relative group overflow-hidden hover:shadow-xl transition-all duration-500">
                        <div className="flex flex-row items-start gap-4 lg:gap-6">
                            <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl overflow-hidden shadow-inner bg-slate-50 flex-shrink-0">
                                {type.images?.[0] ? <img src={type.images[0]} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-5 lg:mt-7 text-slate-200" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-sm lg:text-xl font-bold text-secondary uppercase tracking-tight truncate leading-tight">{type.name}</h3>
                                    <div className="flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
                                        <button onClick={() => {
                                            setEditingType(type);
                                            setFormData({
                                                ...type,
                                                amenities: type.amenities.join(', '),
                                                images: type.images.join(', ')
                                            });
                                            setIsModalOpen(true);
                                        }} className="p-1.5 lg:p-2 bg-slate-50 text-slate-400 rounded-lg lg:rounded-xl hover:text-primary transition-colors"><Edit2 size={12} className="lg:w-4 lg:h-4" /></button>
                                        <button onClick={() => handleDelete(type._id)} className="p-1.5 lg:p-2 bg-rose-50 text-rose-400 rounded-lg lg:rounded-xl hover:text-rose-600 transition-colors"><Trash2 size={12} className="lg:w-4 lg:h-4" /></button>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {type.amenities?.map(a => {
                                        const Icon = getAmenityIcon(a);
                                        return (
                                            <div key={a} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100/50 px-2 py-1 rounded-lg">
                                                <Icon size={10} className="text-primary" />
                                                <span className="text-[8px] font-black text-slate-400 tracking-tight">{a}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-3 lg:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="text-[7px] lg:text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-2 lg:px-3 py-1 lg:py-1.5 rounded lg:rounded-lg flex items-center gap-2">
                                        <Layers size={10} className="text-primary shrink-0" /> {type.availableRooms ?? type.totalRooms} Units available
                                    </div>
                                    <div className="text-[7px] lg:text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-2 lg:px-3 py-1 lg:py-1.5 rounded lg:rounded-lg flex items-center gap-2">
                                        <Home size={10} className="text-primary shrink-0" /> {type.size}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 relative z-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 lg:right-8 lg:top-8 text-slate-400 hover:text-secondary p-2 bg-slate-50 rounded-lg lg:bg-transparent">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize mb-6 lg:mb-8 pr-12">{editingType ? 'Update' : 'Deploy'} <span className="text-primary italic">Category</span></h2>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Type Designation</label>
                                <input required placeholder="Double Bed A/C Room" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Footprint</label>
                                <input required placeholder="120 sq ft" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest Occupancy</label>
                                <input required placeholder="2 Adults + 1 Extra" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bed Infrastructure</label>
                                <input required placeholder="King Size Bed" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none" value={formData.bedType} onChange={e => setFormData({ ...formData, bedType: e.target.value })} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Amenities</label>
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
                                        <option value="">+ Add Amenity Icon...</option>
                                        {commonAmenityNames.sort().map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Plus size={16} /></div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3 px-1">
                                    {formData.amenities.split(',').filter(Boolean).map((a, i) => {
                                        const clean = a.trim();
                                        const Icon = getAmenityIcon(clean);
                                        return (
                                            <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm group/tag">
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
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    Hero Asset Management <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={uploading}
                                        className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-slate-50 transition-all text-slate-400 group"
                                    >
                                        <Upload size={20} className={uploading ? 'animate-bounce text-primary' : 'group-hover:text-primary transition-colors'} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">{uploading ? 'Processing' : 'Add Image'}</span>
                                    </button>

                                    {formData.images.split(',').filter(Boolean).map((url, i) => (
                                        <div key={i} className="w-24 h-24 rounded-2xl relative group overflow-hidden border border-slate-100 shadow-sm">
                                            <img src={url.trim()} className="w-full h-full object-cover" alt="" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const remaining = formData.images.split(',').map(s => s.trim()).filter((_, index) => index !== i);
                                                    setFormData({ ...formData, images: remaining.join(', ') });
                                                }}
                                                className="absolute top-1 right-1 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <button type="submit" className="w-full bg-primary text-secondary py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">Execute Integration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomMgmt;
