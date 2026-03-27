import React, { useState, useEffect } from 'react';
import { 
    CloudUpload, Headphones, Clock, Search, 
    Trash2, Store, Globe, Loader2, Play, Plus, 
    MoreVertical, CheckCircle2
} from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { narrationsApi, languagesApi, merchantApi, storesApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import type { Narration, Language, Store as StoreType } from '../types';

const AudioManagement: React.FC = () => {
    const { user } = useAuth();
    const [narrations, setNarrations] = useState<Narration[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [myStores, setMyStores] = useState<StoreType[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalNarrations, setTotalNarrations] = useState(0);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        storeId: '',
        languageId: '',
        textContent: '',
        audioUrl: '',
        duration: '',
    });

    const fetchData = async (pageNum = page) => {
        setLoading(true);
        try {
            // 1. Luôn lấy danh sách ngôn ngữ
            const langRes = (await languagesApi.getAll()) as any;
            setLanguages(langRes || []);

            if (user?.role === 'admin') {
                // 2a. Đối với Admin: Lấy tất cả narrations và tất cả stores cho dropdown
                const [narrRes, storeRes] = (await Promise.all([
                    narrationsApi.getAll(pageNum, limit),
                    storesApi.getAll(1, 100)
                ])) as any[];
                setNarrations(narrRes.data || []);
                setTotalNarrations(narrRes.total || 0);
                
                const rawStores = (storeRes.data || []) as StoreType[];
                const uniqueStores = Array.from(new Map(rawStores.map(s => [s.id, s])).values());
                setMyStores(uniqueStores);
            } else {
                // 2b. Đối với Merchant: Lấy thông tin cá nhân và narrations theo merchant
                const merchantRes = (await merchantApi.getMe()) as any;
                const rawStores = (merchantRes.stores || []) as StoreType[];
                const uniqueStores = Array.from(new Map(rawStores.map(s => [s.id, s])).values());
                setMyStores(uniqueStores);

                if (merchantRes.id) {
                    const narrRes = (await narrationsApi.getAll(pageNum, limit, merchantRes.id)) as any;
                    setNarrations(narrRes.data || []);
                    setTotalNarrations(narrRes.total || 0);
                }
            }
        } catch (err) {
            console.error('Lỗi khi lấy dữ liệu audio:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchData(newPage);
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleUpload = async () => {
        if (!formData.storeId || !formData.languageId) {
            alert('Vui lòng chọn cửa hàng và ngôn ngữ');
            return;
        }

        // Kiểm tra trùng lặp
        const isDuplicate = narrations.some(n => n.storeId === formData.storeId && n.languageId === formData.languageId);
        if (isDuplicate) {
            alert('Địa điểm này đã có bản thuyết minh cho ngôn ngữ đã chọn.');
            return;
        }

        try {
            await storesApi.createNarration(formData.storeId, {
                languageId: formData.languageId,
                textContent: formData.textContent,
                audioUrl: formData.audioUrl || undefined,
                duration: formData.duration ? parseInt(formData.duration) : undefined,
            });
            setIsUploadOpen(false);
            setFormData({ storeId: '', languageId: '', textContent: '', audioUrl: '', duration: '' });
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi tải lên audio');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa bản thuyết minh này?')) return;
        try {
            await narrationsApi.remove(id);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi xóa audio');
        }
    };

    const filteredAudio = narrations.filter((audio: Narration) => 
        (audio.textContent || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const togglePlay = (url: string) => {
        if (playingUrl === url) {
            audioPlayer?.pause();
            setPlayingUrl(null);
        } else {
            if (audioPlayer) audioPlayer.pause();
            const newPlayer = new Audio(url);
            newPlayer.play();
            newPlayer.onended = () => setPlayingUrl(null);
            setAudioPlayer(newPlayer);
            setPlayingUrl(url);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Headphones className="text-primary-600" size={32} />
                        Quản lý Audio
                    </h1>
                    <p className="text-slate-500">Hệ thống âm thanh thuyết minh và kể chuyện (Storytelling).</p>
                </div>
                <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-sm shadow-primary-500/20"
                >
                    <Plus size={20} />
                    Tạo thuyết minh mới
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500 mb-1">Tổng số audio</div>
                    <div className="text-2xl font-bold text-slate-900">{totalNarrations}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500 mb-1">Đang hoạt động</div>
                    <div className="text-2xl font-bold text-emerald-600">{narrations.filter(n => n.isActive).length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500 mb-1">Ngôn ngữ</div>
                    <div className="text-2xl font-bold text-indigo-600">{languages.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500 mb-1">Địa điểm phủ sóng</div>
                    <div className="text-2xl font-bold text-amber-600">{myStores.length}</div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm nội dung audio, địa điểm..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary-500" size={40} />
                    </div>
                )}
                {filteredAudio.map((file) => (
                    <div key={file.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <button 
                                    onClick={() => file.audioUrl && togglePlay(file.audioUrl)}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${playingUrl === file.audioUrl ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 animate-pulse' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}
                                >
                                    {playingUrl === file.audioUrl ? <Loader2 className="animate-spin" size={24} /> : <Play size={24} fill="currentColor" />}
                                </button>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><MoreVertical size={16} /></button>
                                    <button onClick={() => handleDelete(file.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">
                                Thuyết minh {file.language?.name}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1 italic">
                                "{file.textContent || 'Không có nội dung văn bản'}"
                            </p>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium uppercase tracking-tighter flex items-center gap-1">
                                        <Store size={12} /> Cửa hàng
                                    </span>
                                    <span className="font-bold text-slate-700">{file.store?.name || myStores.find(s => s.id === file.storeId)?.name || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium uppercase tracking-tighter flex items-center gap-1">
                                        <Globe size={12} /> Ngôn ngữ
                                    </span>
                                    <span className="font-bold text-primary-600">{file.language?.name} ({file.language?.code})</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium uppercase tracking-tighter flex items-center gap-1">
                                        <Clock size={12} /> Thời lượng
                                    </span>
                                    <span className="font-bold text-slate-700">{file.duration ? `${Math.floor(file.duration/60)}:${(file.duration%60).toString().padStart(2,'0')}` : 'Auto-gen'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <span className={`flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${file.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                {file.isActive ? <CheckCircle2 size={10} /> : null}
                                {file.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
                            </span>
                            <button 
                                onClick={() => file.audioUrl && togglePlay(file.audioUrl)}
                                className="text-primary-600 text-xs font-bold hover:underline"
                            >
                                {playingUrl === file.audioUrl ? 'Đang phát...' : 'Phát thử audio'}
                            </button>
                        </div>
                    </div>
                ))}
                {!loading && filteredAudio.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white border border-slate-200 rounded-2xl">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Headphones size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Chưa có bản thuyết minh nào</h3>
                        <p className="text-slate-500 mt-1">Hãy thêm bản thuyết minh đầu tiên cho các địa điểm của bạn.</p>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <Pagination 
                    currentPage={page} 
                    totalItems={totalNarrations} 
                    itemsPerPage={limit} 
                    onPageChange={handlePageChange} 
                />
            </div>

            {/* Upload Audio Modal */}
            <Modal 
                isOpen={isUploadOpen} 
                onClose={() => setIsUploadOpen(false)}
                title="Tạo bản thuyết minh mới"
                maxWidth="max-w-2xl"
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Địa điểm dừng chân</label>
                            <select 
                                value={formData.storeId} 
                                onChange={e => setFormData({...formData, storeId: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            >
                                <option value="">Chọn địa điểm...</option>
                                {myStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngôn ngữ thuyết minh</label>
                            <select 
                                value={formData.languageId} 
                                onChange={e => setFormData({...formData, languageId: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            >
                                <option value="">Chọn ngôn ngữ...</option>
                                {languages.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Audio URL (Tùy chọn ghi đè)</label>
                            <input 
                                type="text" 
                                value={formData.audioUrl} 
                                onChange={e => setFormData({...formData, audioUrl: e.target.value})}
                                placeholder="https://...audio.mp3"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Thời lượng (Giây)</label>
                            <input 
                                type="number" 
                                value={formData.duration} 
                                onChange={e => setFormData({...formData, duration: e.target.value})}
                                placeholder="120"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Nội dung thuyết minh (Hệ thống sẽ tự động chuyển thành Audio)</label>
                        <textarea 
                            rows={6} 
                            value={formData.textContent} 
                            onChange={e => setFormData({...formData, textContent: e.target.value})}
                            placeholder="Nhập nội dung câu chuyện hoặc thông tin giới thiệu về địa điểm này..." 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                        ></textarea>
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 uppercase font-bold tracking-tight">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            Đã tích hợp công nghệ AI Storytelling chuyển văn bản thành giọng nói tự nhiên.
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => setIsUploadOpen(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleUpload}
                            className="bg-primary-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 flex items-center gap-2"
                        >
                            <CloudUpload size={20} />
                            Tạo và Xuất bản ngay
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AudioManagement;

