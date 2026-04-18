import React, { useState, useEffect } from 'react';
import { 
    MapPin, Search, Plus, Filter, Edit2, Trash2, 
    Loader2, Music, Utensils, AlertCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { storesApi, merchantApi, adminApi, subscriptionsApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import type { Store } from '../types';
import MapSelector from '../components/MapSelector';
import ImageUpload from '../components/ImageUpload';

const POIManagement: React.FC = () => {
    const { user } = useAuth();
    const [pois, setPois] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPois, setTotalPois] = useState(0);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddPoiOpen, setIsAddPoiOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPoi, setSelectedPoi] = useState<any | null>(null);
    const [merchants, setMerchants] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '', address: '', description: '', lat: 10.4967, lng: 105.1167,
        openTime: '08:00', closeTime: '22:00', coverImage: '',
        status: 'active' as 'active' | 'pending' | 'hidden',
        merchantId: ''
    });

    const fetchData = async (pageNum = page) => {
        setLoading(true);
        try {
            if (user?.role === 'admin') {
                const [storeRes, merchantRes] = (await Promise.all([
                    storesApi.getAll(pageNum, limit, 'all'),
                    adminApi.getMerchants(1, 100)
                ])) as any[];
                setPois(storeRes.data || []);
                setTotalPois(storeRes.total || 0);
                setMerchants(merchantRes.data || []);
            } else {
                // If merchant, get their ID from their profile then fetch their stores with pagination
                const [merchantProfile, subRes] = (await Promise.all([
                    merchantApi.getMe(),
                    subscriptionsApi.getMy()
                ])) as any[];
                
                setSubscription(subRes);

                if (merchantProfile && merchantProfile.id) {
                    const storeRes = (await storesApi.getAll(pageNum, limit, 'all', merchantProfile.id)) as any;
                    setPois(storeRes.data || []);
                    setTotalPois(storeRes.total || 0);
                }
            }
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu:', err);
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

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Vui lòng nhập tên địa điểm';
        if (!formData.address.trim()) errors.address = 'Vui lòng chọn vị trí trên bản đồ';
        if (!formData.coverImage) errors.coverImage = 'Vui lòng tải lên ảnh minh họa';
        if (user?.role === 'admin' && !formData.merchantId) errors.merchantId = 'Vui lòng chọn đối tác quản lý';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateForm()) return;
        try {
            await storesApi.create({
                ...formData,
                lat: Number(formData.lat) || 0,
                lng: Number(formData.lng) || 0,
                merchantId: user?.role === 'admin' ? formData.merchantId : undefined
            });
            setIsAddPoiOpen(false);
            fetchData();
            setFormErrors({});
        } catch (err: any) {
            alert(err.message || 'Lỗi khi tạo POI');
        }
    };

    const handleUpdate = async () => {
        if (!selectedPoi) return;
        if (!validateForm()) return;
        try {
            await storesApi.update(selectedPoi.id, {
                ...formData,
                lat: Number(formData.lat) || 0,
                lng: Number(formData.lng) || 0,
            });
            setIsEditOpen(false);
            fetchData();
            setFormErrors({});
        } catch (err: any) {
            alert(err.message || 'Lỗi khi cập nhật POI');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa điểm POI này?')) return;
        try {
            await storesApi.remove(id);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi xóa POI');
        }
    };

    const openEdit = (poi: Store) => {
        setSelectedPoi(poi);
        setFormData({
            name: poi.name,
            address: poi.address || '',
            description: poi.description || '',
            lat: Number(poi.lat),
            lng: Number(poi.lng),
            openTime: poi.openTime || '08:00',
            closeTime: poi.closeTime || '22:00',
            coverImage: poi.coverImage || '',
            status: (poi.status as any) || 'active',
            merchantId: poi.merchantId || ''
        });
        setIsEditOpen(true);
    };

    const filteredPOI = pois.filter(poi =>
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (poi.address || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({ 
            name: '', address: '', description: '', 
            lat: 10.4967, lng: 105.1167, 
            openTime: '08:00', closeTime: '22:00', coverImage: '', 
            status: 'active', merchantId: '' 
        });
        setSelectedPoi(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <MapPin className="text-primary-600" size={32} />
                        Vị trí (POI)
                    </h1>
                    <p className="text-slate-500">Đồng bộ dữ liệu điểm tham quan với hệ thống Mobile App.</p>
                </div>
                <div className="flex items-center gap-3">
                    {user?.role === 'merchant' && (
                        <div className={`px-4 py-2 rounded-xl border font-bold text-sm ${
                            totalPois >= (subscription?.maxPOI || 1) 
                                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                            Giới hạn: {totalPois} / {subscription?.maxPOI || 1} POI
                        </div>
                    )}
                    <button onClick={() => fetchData()} className="p-2.5 text-slate-500 hover:text-primary-600 bg-white border border-slate-200 rounded-xl transition-all shadow-sm">
                        <Loader2 className={loading ? 'animate-spin' : ''} size={20} />
                    </button>
                    <button
                        disabled={user?.role === 'merchant' && totalPois >= (subscription?.maxPOI || 1)}
                        onClick={() => { resetForm(); setIsAddPoiOpen(true); }}
                        className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${
                            user?.role === 'merchant' && totalPois >= (subscription?.maxPOI || 1)
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20'
                        }`}
                    >
                        <Plus size={20} /> Thêm địa điểm
                    </button>
                </div>
            </div>


            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên, địa chỉ hoặc mô tả..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                    <Filter size={18} /> Bộ lọc
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPOI.map((poi) => (
                    <div key={poi.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-48 md:h-auto relative">
                            <img 
                                src={poi.coverImage ? (poi.coverImage.startsWith('http') ? poi.coverImage : `http://localhost:3000${poi.coverImage}`) : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'} 
                                alt={poi.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase">
                                {poi.status === 'active' ? 'Hoạt động' : poi.status === 'pending' ? 'Chờ duyệt' : 'Ẩn'}
                            </div>
                        </div>
                        <div className="flex-1 p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{poi.name}</h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={14} className="shrink-0" />
                                        <span className="line-clamp-1">{poi.address}</span>
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(poi)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(poi.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                                {poi.description || 'Chưa có mô tả cho địa điểm này.'}
                            </p>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                        <Music size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Thuyết minh</div>
                                        <div className="text-sm font-bold text-slate-700">{poi._count?.narrations || 0} bản</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Utensils size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Thực đơn</div>
                                        <div className="text-sm font-bold text-slate-700">{poi._count?.menus || 0} món</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <Pagination 
                    currentPage={page} 
                    totalItems={totalPois} 
                    itemsPerPage={limit} 
                    onPageChange={handlePageChange} 
                />
            </div>

            {!loading && filteredPOI.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Không tìm thấy địa điểm nào</h3>
                    <p className="text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc thêm điểm mới.</p>
                </div>
            )}

            {/* Modals with enhanced side-by-side layout */}
            <Modal isOpen={isAddPoiOpen || isEditOpen} onClose={() => { setIsAddPoiOpen(false); setIsEditOpen(false); }} title={isAddPoiOpen ? "Thêm POI mới" : `Chỉnh sửa: ${selectedPoi?.name}`} maxWidth="max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Map & Location (Wide) */}
                    <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-[10px]">Tên địa điểm (POI)</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData((prev: any) => ({ ...prev, name: e.target.value }))} 
                                    placeholder="Nhập tên điểm dừng..." 
                                    className={`w-full px-4 py-3 bg-white border ${formErrors.name ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold`} 
                                />
                                {formErrors.name && <p className="text-rose-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} /> {formErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-[10px]">Địa chỉ thực tế</label>
                                <textarea 
                                    readOnly={true}
                                    value={formData.address} 
                                    placeholder="Địa chỉ cụ thể..." 
                                    className={`w-full px-4 py-3 bg-slate-100 border ${formErrors.address ? 'border-rose-300' : 'border-slate-200'} rounded-xl text-slate-500 h-20 resize-none italic`} 
                                />
                                {formErrors.address && <p className="text-rose-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} /> {formErrors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider text-[10px]">Chọn vị trí trên bản đồ</label>
                                <MapSelector 
                                    lat={formData.lat ? parseFloat(String(formData.lat)) : 10.4967} 
                                    lng={formData.lng ? parseFloat(String(formData.lng)) : 105.1167} 
                                    onChange={(lat, lng) => setFormData((prev: any) => ({ ...prev, lat, lng }))} 
                                    onAddressChange={(address) => setFormData((prev: any) => ({ ...prev, address }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details (Narrow) */}
                    <div className="space-y-6 order-1 lg:order-2">
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">Mở cửa</label>
                                    <input 
                                        type="time" 
                                        value={formData.openTime} 
                                        onChange={e => setFormData((prev: any) => ({ ...prev, openTime: e.target.value }))} 
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">Đóng cửa</label>
                                    <input 
                                        type="time" 
                                        value={formData.closeTime} 
                                        onChange={e => setFormData((prev: any) => ({ ...prev, closeTime: e.target.value }))} 
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium" 
                                    />
                                </div>
                            </div>
                            
                            <ImageUpload 
                                label="Ảnh đại diện địa điểm"
                                value={formData.coverImage}
                                onChange={(url) => setFormData((prev: any) => ({ ...prev, coverImage: url as string }))}
                            />
                            {formErrors.coverImage && <p className="text-rose-500 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} /> {formErrors.coverImage}</p>}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">Mô tả địa điểm</label>
                                <textarea 
                                    rows={4} 
                                    value={formData.description} 
                                    onChange={e => setFormData((prev: any) => ({ ...prev, description: e.target.value }))} 
                                    placeholder="Giới thiệu về địa điểm này..." 
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none h-32" 
                                />
                            </div>

                            {(user?.role === 'admin' || isEditOpen) && (
                                <div className="pt-4 border-t border-slate-100 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">Merchant sở hữu</label>
                                        {user?.role === 'admin' ? (
                                            <>
                                                <select
                                                    disabled={isEditOpen}
                                                    value={formData.merchantId}
                                                    onChange={e => setFormData((prev: any) => ({ ...prev, merchantId: e.target.value }))}
                                                    className={`w-full px-3 py-2.5 border ${formErrors.merchantId ? 'border-rose-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 ${isEditOpen ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                                >
                                                    <option value="">-- Chọn đối tác --</option>
                                                    {merchants.map(m => (
                                                        <option key={m.id} value={m.id}>{m.businessName}</option>
                                                    ))}
                                                </select>
                                                {formErrors.merchantId && <p className="text-rose-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} /> {formErrors.merchantId}</p>}
                                                {isEditOpen && <p className="text-[10px] text-slate-400 mt-1 italic">* Không thể thay đổi chủ sở hữu sau khi đã tạo.</p>}
                                            </>
                                        ) : (
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value={selectedPoi?.merchant?.businessName || 'N/A'} 
                                                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" 
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {(isEditOpen || user?.role === 'admin') && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">Trạng thái</label>
                                    <select 
                                        value={formData.status} 
                                        onChange={e => setFormData((prev: any) => ({ ...prev, status: e.target.value as any }))} 
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="pending">Chờ duyệt</option>
                                        <option value="hidden">Ẩn</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                    <button onClick={() => { setIsAddPoiOpen(false); setIsEditOpen(false); }} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
                    <button onClick={isAddPoiOpen ? handleCreate : handleUpdate} className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all">
                        {isAddPoiOpen ? 'Lưu thông tin' : 'Lưu thay đổi'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default POIManagement;


