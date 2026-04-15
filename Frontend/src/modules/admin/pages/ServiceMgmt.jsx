import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Search, Plus, Trash2, Edit2, X, Coffee, Waves, Heart, Image as ImageIcon } from 'lucide-react';

const ServiceMgmt = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dine'); // 'dine', 'dip', 'care'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'dine',
        category: 'General',
        description: '',
        price: 0,
        image: '',
        isActive: true
    });

    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/services');
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parseFloat(formData.price) < 0) {
            alert('Starting price cannot be negative');
            return;
        }
        try {
            if (editingItem) {
                await api.put(`/services/${editingItem._id}`, formData);
            } else {
                await api.post('/services', formData);
            }
            setIsModalOpen(false);
            setEditingItem(null);
            resetForm();
            fetchServices();
        } catch (error) {
            console.error(error);
            alert('Operation failed');
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setPreviewUrl(URL.createObjectURL(file));

        const data = new FormData();
        data.append('image', file);

        try {
            const res = await api.post('/media/upload-single', data);
            setFormData(prev => ({ ...prev, image: res.data.imageUrl }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this service item?')) return;
        try {
            await api.delete(`/services/${id}`);
            fetchServices();
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: activeTab,
            category: 'General',
            description: '',
            price: 0,
            image: '',
            isActive: true
        });
        setPreviewUrl('');
    };

    const filteredServices = services.filter(s => s.type === activeTab);

    if (loading) return (
        <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
    );

    return (
        <div className="space-y-6 lg:space-y-10 animate-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">
                        Service <span className="text-primary italic">Management</span>
                    </h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight">Configure dining, water activities, and wellness offerings.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({ ...formData, type: activeTab });
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-secondary text-white px-6 lg:px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] lg:text-[10px] shadow-xl hover:shadow-secondary/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Deploy Service
                </button>
            </header>

            {/* Tab Selector */}
            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl lg:rounded-[1.5rem] w-full sm:w-fit overflow-x-auto custom-scrollbar no-scrollbar">
                <div className="flex gap-1.5 min-w-full sm:min-w-0">
                    {[
                        { id: 'dine', icon: Coffee, label: 'Dining' },
                        { id: 'dip', icon: Waves, label: 'Pool/Dip' },
                        { id: 'care', icon: Heart, label: 'Wellness' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-white text-secondary shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon size={10} className={activeTab === tab.id ? 'text-primary' : ''} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredServices.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] lg:rounded-[3rem]">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic px-6">No {activeTab} assets deployed yet.</p>
                    </div>
                ) : (
                    filteredServices.map(item => (
                        <div key={item._id} className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] p-4 lg:p-6 border border-slate-100 shadow-sm relative group overflow-hidden hover:shadow-xl transition-all duration-500">
                            <div className="flex flex-row items-start gap-4 lg:gap-5">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-3xl overflow-hidden shadow-inner bg-slate-50 flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.name} />
                                    ) : (
                                        <ImageIcon className="m-auto mt-5 lg:mt-6 text-slate-200" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="text-xs lg:text-sm font-black text-secondary uppercase tracking-tight truncate leading-tight mt-0.5">{item.name}</h3>
                                        <div className="flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
                                            <button onClick={() => {
                                                setEditingItem(item);
                                                setFormData(item);
                                                setIsModalOpen(true);
                                            }} className="p-1.5 bg-slate-50 text-slate-400 rounded-lg lg:rounded-xl hover:text-primary transition-colors"><Edit2 size={12} /></button>
                                            <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-rose-50 text-rose-400 rounded-lg lg:rounded-xl hover:text-rose-600 transition-colors"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                    <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider truncate">{item.category}</p>
                                    <div className="mt-3 lg:mt-4 flex items-center justify-between">
                                        <span className="text-[8px] lg:text-[9px] font-black uppercase text-primary bg-primary/5 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-md lg:rounded-lg">
                                            ₹{item.price || 'NA'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[6px] font-black uppercase tracking-widest ${item.isActive ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                {item.isActive ? 'Active' : 'Offline'}
                                            </span>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-xl rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 relative z-10 animate-in zoom-in-95 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 lg:right-8 lg:top-8 text-slate-400 hover:text-secondary p-2 bg-slate-50 rounded-lg lg:bg-transparent">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize mb-6 lg:mb-8 pr-12">
                            {editingItem ? 'Update' : 'Deploy'} <span className="text-primary italic">Service</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                                    <input required placeholder="e.g. Infinity Pool" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Type</label>
                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="dine">Dining</option>
                                        <option value="dip">Pool/Dip</option>
                                        <option value="care">Wellness/Care</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                                    <input placeholder="e.g. Breakfast, Massage" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Starting Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none"
                                        value={formData.price}
                                        onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            setFormData({ ...formData, price: val < 0 ? 0 : e.target.value });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea rows="3" placeholder="Brief narrative for this offering..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Asset Image</label>
                                <div className={`relative h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 overflow-hidden transition-all
                                    ${formData.image || previewUrl ? 'border-primary/50 bg-slate-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>

                                    {(formData.image || previewUrl) ? (
                                        <>
                                            <img src={formData.image || previewUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <p className="text-[8px] font-black text-white uppercase tracking-widest">Click to change</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="text-slate-300" size={24} />
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select Image Asset</p>
                                        </>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={uploading}
                                    />

                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                {formData.image && <p className="text-[8px] text-slate-400 truncate mt-1">Stored: {formData.image}</p>}
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full bg-primary text-secondary py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                                    Execute Integration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceMgmt;
