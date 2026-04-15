import { useState, useEffect } from 'react';
import { Image, Plus, Trash2, Globe, Layout, X, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const CATEGORIES = ['Exterior', 'Rooms', 'Pool', 'Restaurant', 'Lobby', 'Events'];

const MediaMgmt = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('banner'); // 'banner' or 'gallery'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        subtext: '',
        type: 'banner',
        category: CATEGORIES[0]
    });

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/media/${activeTab}`);
            setMedia(data);
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, [activeTab]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return alert('Please select a file');

        setUploading(true);
        const data = new FormData();
        data.append('image', selectedFile);
        data.append('type', formData.type);
        data.append('title', formData.title);
        data.append('subtext', formData.subtext);
        if (formData.type === 'gallery') {
            data.append('category', formData.category);
        }

        try {
            await api.post('/media/upload', data);
            setIsModalOpen(false);
            resetForm();
            fetchMedia();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this asset? This cannot be undone.')) return;
        try {
            await api.delete(`/media/${id}`);
            fetchMedia();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleToggle = async (id) => {
        try {
            await api.patch(`/media/${id}/toggle`);
            fetchMedia();
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setFormData({ title: '', subtext: '', type: activeTab, category: CATEGORIES[0] });
    };

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-secondary lowercase capitalize tracking-tight leading-none mb-1">Media <span className="text-primary italic">Vault</span></h1>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-tight mt-1">Manage visual storytelling assets for banners and galleries.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ ...formData, type: activeTab });
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-secondary text-white px-6 lg:px-8 py-3.5 rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-secondary/20 active:scale-95 group"
                >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Upload New Asset
                </button>
            </header>

            {/* Tabs */}
            <div className="flex bg-white/50 p-1.5 rounded-2xl border border-slate-100 shadow-inner overflow-x-auto custom-scrollbar no-scrollbar">
                {[
                    { id: 'banner', label: 'Hero Banners', icon: Globe },
                    { id: 'gallery', label: 'Photo Gallery', icon: Layout },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-1 items-center justify-center gap-2.5 px-6 lg:px-8 py-3 lg:py-3.5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all rounded-[1.25rem] whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-lg shadow-primary/5 border border-primary/10'
                                : 'text-slate-400 hover:text-secondary hover:bg-white/50'}`}
                    >
                        <tab.icon size={12} className={activeTab === tab.id ? 'text-primary' : 'text-slate-300'} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Vault...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8 pb-20">
                    {media.length === 0 ? (
                        <div className="col-span-full py-20 text-center space-y-4 bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200">
                            <Image size={40} className="mx-auto text-slate-200" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No assets detected in sector.</p>
                        </div>
                    ) : (
                        media.map((item) => (
                            <div key={item._id} className="group bg-white rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1">
                                <div className="relative h-40 lg:h-48 overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                        <button
                                            onClick={() => handleToggle(item._id)}
                                            className={`p-2 rounded-xl border-2 backdrop-blur-md transition-all ${item.isActive ? 'bg-emerald-500/80 border-white/50 text-white' : 'bg-slate-500/80 border-white/50 text-white'}`}
                                        >
                                            <CheckCircle2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 bg-rose-500/80 border-2 border-white/50 backdrop-blur-md text-white rounded-xl hover:bg-rose-600 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                                        {item.isActive ? 'Active' : 'Archived'}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary truncate flex-1">{item.title || 'Untitled Asset'}</p>
                                        {item.category && (
                                            <span className="text-[7px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{item.subtext || 'No description provided.'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={() => !uploading && setIsModalOpen(false)} />
                    <div className="bg-white rounded-[2rem] lg:rounded-[3rem] w-full max-w-xl p-6 lg:p-12 relative z-10 animate-in zoom-in duration-300 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            disabled={uploading}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 lg:top-8 lg:right-8 p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-secondary active:scale-90"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8 lg:mb-10">
                            <h2 className="text-xl lg:text-3xl font-black text-secondary lowercase capitalize tracking-tight">Ingest <span className="text-primary italic">Media</span></h2>
                            <p className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Propagate visual assets to our global CDN.</p>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6 lg:space-y-8 text-left">
                            {/* File Upload Area */}
                            <div className={`relative h-56 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden
                                ${previewUrl ? 'border-primary/50 bg-slate-50' : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50'}`}>

                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Preview" />
                                        <div className="relative z-10 text-center p-4">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-3 mx-auto">
                                                <UploadCloud className="text-primary" />
                                            </div>
                                            <p className="text-xs font-black text-secondary truncate max-w-[200px]">{selectedFile?.name}</p>
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 hover:border-b border-rose-500"
                                            >
                                                Discard & Change
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                            <UploadCloud size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-secondary">Drop asset here or <span className="text-primary italic">browse</span></p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">supports jpg, png, webp (max 5mb)</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Title</label>
                                    <input
                                        type="text"
                                        placeholder="Luxury Suite View"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type Classification</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="banner">Hero Banner</option>
                                        <option value="gallery">Photo Gallery</option>
                                    </select>
                                </div>
                            </div>

                            {formData.type === 'gallery' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gallery Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                                                    ${formData.category === cat ? 'bg-secondary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-secondary'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Description</label>
                                <textarea
                                    placeholder="Brief narrative for this visual asset..."
                                    rows="3"
                                    value={formData.subtext}
                                    onChange={e => setFormData({ ...formData, subtext: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>

                            <button
                                disabled={uploading || !selectedFile}
                                className="w-full bg-primary text-secondary py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                                        Streaming to CDN...
                                    </>
                                ) : (
                                    <>
                                        <Globe size={14} />
                                        Execute CDN Deployment
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaMgmt;
