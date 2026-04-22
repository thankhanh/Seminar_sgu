import React, { useState } from 'react';
import { 
    Store as StoreIcon, Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
    MapPin, CheckCircle2, XCircle, Loader2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

import { storesApi, merchantApi, adminApi, subscriptionsApi } from '../utils/api';
import MapSelector from '../components/MapSelector';
import ImageUpload from '../components/ImageUpload';
import QRManagement from '../components/QRManagement';
import NarrationManagement from '../components/NarrationManagement';
import type { Store } from '../types';

const StoreManagement: React.FC = () => {
    const { user } = useAuth();
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalStores, setTotalStores] = useState(0);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [merchants, setMerchants] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        lat: 10.4967,
        lng: 105.1167,
        description: '',
        openTime: '08:00',
        closeTime: '22:00',
        coverImage: '',
        status: 'pending' as 'pending' | 'active' | 'hidden',
        merchantId: '',
        images: [] as string[],
    });

    const fetchStores = async (pageNum = page) => {
        setLoading(true);
        try {
            if (user?.role === 'admin') {
                const [storeRes, merchantRes] = (await Promise.all([
                    storesApi.getAll(pageNum, limit, 'all'),
                    adminApi.getMerchants(1, 100)
                ])) as any[];
                setStores(storeRes.data || []);
                setTotalStores(storeRes.total || 0);
                setMerchants(merchantRes.data || []);
            } else {
                const [response, subRes] = (await Promise.all([
                    merchantApi.getMe(),
                    subscriptionsApi.getMy()
                ])) as any[];
                
                setSubscription(subRes);
                // Merchant gets all their stores for now (local pagination if needed)
                const myStores = response.stores || [];
                setStores(myStores);
                setTotalStores(myStores.length);
            }
        } catch (err) {
            console.error('Lỗi khi lấy danh sách cửa hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchStores(newPage);
    };

    React.useEffect(() => {
        if (user) fetchStores();
    }, [user]);

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Vui lòng nhập tên cửa hàng';
        if (!formData.address.trim()) errors.address = 'Vui lòng chọn vị trí trên bản đồ để lấy địa chỉ';
        if (!formData.coverImage) errors.coverImage = 'Vui lòng tải lên ảnh bìa cho cửa hàng';
        if (user?.role === 'admin' && !formData.merchantId) errors.merchantId = 'Vui lòng chọn đối tác sở hữu';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateForm()) return;
        try {
            await storesApi.create(formData);
            alert('Thêm cửa hàng thành công!');
            setIsAddStoreOpen(false);
            fetchStores();
            setFormErrors({});
        } catch (err: any) {
            alert(err.message || 'Lỗi khi tạo cửa hàng');
        }
    };

    const handleUpdate = async () => {
        if (!selectedStore) return;
        if (!validateForm()) return;
        try {
            await storesApi.update(selectedStore.id, formData);
            alert('Cập nhật thông tin thành công!');
            setIsEditOpen(false);
            fetchStores();
            setFormErrors({});
        } catch (err: any) {
            alert(err.message || 'Lỗi khi cập nhật cửa hàng');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này?')) {
            try {
                await storesApi.remove(id);
                alert('Xóa cửa hàng thành công!');
                fetchStores();
            } catch (err) {
                alert('Lỗi khi xóa cửa hàng');
            }
        }
    };

    const openEdit = (store: Store) => {
        setSelectedStore(store);
        setFormData({
            name: store.name,
            address: store.address,
            lat: store.lat,
            lng: store.lng,
            description: store.description || '',
            openTime: (store.openTime || '08:00').substring(0, 5),
            closeTime: (store.closeTime || '22:00').substring(0, 5),
            coverImage: store.coverImage || '',
            status: store.status as any,
            merchantId: store.merchantId || '',
            images: store.images?.map(img => img.imageUrl) || [],
        });
        setIsEditOpen(true);
    };

    const filteredStores = stores.filter((store: Store) => 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            lat: 10.4967,
            lng: 105.1167,
            description: '',
            openTime: '08:00',
            closeTime: '22:00',
            coverImage: '',
            status: 'pending',
            merchantId: '',
            images: [],
        });
        setSelectedStore(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <StoreIcon className="text-primary-500" />
                        Quản lý cửa hàng
                    </h1>
                    <p className="text-slate-500 mt-1">Quản lý danh sách các gian hàng và đối tác kinh doanh.</p>
                </div>
                <div className="flex items-center gap-3">
                    {user?.role === 'merchant' && (
                        <div className={`px-4 py-2 rounded-xl border font-bold text-sm ${
                            totalStores >= (subscription?.maxStore || 1) 
                                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                            Giới hạn: {totalStores} / {subscription?.maxStore || 1} Cửa hàng
                        </div>
                    )}
                    <button 
                        disabled={user?.role === 'merchant' && totalStores >= (subscription?.maxStore || 1)}
                        onClick={() => { resetForm(); setIsAddStoreOpen(true); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors shadow-sm ${
                            user?.role === 'merchant' && totalStores >= (subscription?.maxStore || 1)
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20'
                        }`}
                    >
                        <Plus size={20} />
                        <span>Thêm cửa hàng</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm cửa hàng, chủ sở hữu..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors whitespace-nowrap">
                    <Filter size={20} />
                    <span>Lọc danh sách</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary-500" size={40} />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="px-6 py-4 font-semibold">Tên cửa hàng/POI</th>
                                <th className="px-6 py-4 font-semibold">Địa chỉ & Vị trí</th>
                                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold">Cửa hàng/Đối tác</th>
                                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredStores.map((store: Store) => (
                                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold overflow-hidden">
                                                {store.coverImage ? (
                                                    <img src={store.coverImage.startsWith('http') ? store.coverImage : `http://localhost:3000${store.coverImage}`} alt="" className="w-full h-full object-cover" />
                                                ) : store.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{store.name}</div>
                                                <div className="text-xs text-slate-500">ID: {store.id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <MapPin size={16} className="text-slate-400" />
                                            {store.address}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5 ml-5">
                                            {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {store.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <CheckCircle2 size={14} /> Hoạt động
                                            </span>
                                        ) : store.status === 'pending' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                <MoreVertical size={14} /> Chờ duyệt
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                <XCircle size={14} /> Tạm khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{store.merchant?.businessName || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(store)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Chỉnh sửa">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(store.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                                                <Trash2 size={18} />
                                            </button>
                                            <button onClick={() => { setSelectedStore(store); setIsDetailOpen(true); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Chi tiết">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStores.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Không tìm thấy cửa hàng nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200">
                    <Pagination 
                        currentPage={page} 
                        totalItems={totalStores} 
                        itemsPerPage={limit} 
                        onPageChange={handlePageChange} 
                    />
                </div>
            </div>

            {/* Form Modal (Combined Add/Edit for brevity if needed, but let's update both) */}
            <Modal 
                isOpen={isAddStoreOpen || isEditOpen} 
                onClose={() => { setIsAddStoreOpen(false); setIsEditOpen(false); }}
                title={isAddStoreOpen ? "Thêm cửa hàng mới" : "Chỉnh sửa cửa hàng"}
                maxWidth="max-w-5xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Info & Images */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Tên cửa hàng/POI</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData(prev => ({...prev, name: e.target.value}))} 
                                placeholder="Nhập tên cửa hàng..." 
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 font-bold" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Giờ mở cửa</label>
                                <input type="time" value={formData.openTime} onChange={e => setFormData(prev => ({...prev, openTime: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Giờ đóng cửa</label>
                                <input type="time" value={formData.closeTime} onChange={e => setFormData(prev => ({...prev, closeTime: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Mô tả</label>
                            <textarea 
                                value={formData.description} 
                                onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                                placeholder="Giới thiệu ngắn gọn về cửa hàng..." 
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 h-24 resize-none transition-all" 
                            />
                        </div>

                        <ImageUpload 
                            label="Ảnh bìa cửa hàng"
                            value={formData.coverImage}
                            onChange={(url) => setFormData((prev: any) => ({ ...prev, coverImage: url as string }))}
                        />
                        {formErrors.coverImage && <p className="text-rose-500 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle size={10} /> {formErrors.coverImage}</p>}

                        <ImageUpload 
                            label="Ảnh bổ sung (Gallery)"
                            multiple={true}
                            value={formData.images} 
                            onChange={(urls) => setFormData(prev => ({...prev, images: urls as string[]}))} 
                        />

                        {(user?.role === 'admin' || isEditOpen) && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Chủ sở hữu (Merchant)</label>
                                {user?.role === 'admin' ? (
                                    <>
                                        <select 
                                            disabled={isEditOpen}
                                            value={formData.merchantId} 
                                            onChange={e => setFormData(prev => ({...prev, merchantId: e.target.value}))}
                                            className={`w-full px-4 py-2.5 border ${formErrors.merchantId ? 'border-rose-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 ${isEditOpen ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">-- Chọn đối tác --</option>
                                            {merchants.map(m => (
                                                <option key={m.id} value={m.id}>{m.businessName} ({m.user?.email})</option>
                                            ))}
                                        </select>
                                        {formErrors.merchantId && <p className="text-rose-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} /> {formErrors.merchantId}</p>}
                                        {isEditOpen && <p className="text-[10px] text-slate-400 mt-1 italic">* Không thể thay đổi chủ sở hữu sau khi đã tạo.</p>}
                                    </>
                                ) : (
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={selectedStore?.merchant?.businessName || 'N/A'} 
                                        className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" 
                                    />
                                )}
                            </div>
                        )}

                        {/* Status logic: Show only when editing or if Admin */}
                        {(isEditOpen || user?.role === 'admin') && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Trạng thái duyệt</label>
                                <select value={formData.status} onChange={e => setFormData(prev => ({...prev, status: e.target.value as any}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900">
                                    <option value="pending">Chờ duyệt (Pending)</option>
                                    <option value="active">Hoạt động (Active)</option>
                                    <option value="hidden">Ẩn (Hidden)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Map & Address Search */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Địa chỉ & Vị trí</label>
                            <textarea 
                                readOnly={true}
                                value={formData.address} 
                                placeholder="Địa chỉ sẽ tự động cập nhật khi bạn chọn trên bản đồ..." 
                                className={`w-full px-4 py-3 bg-slate-50 border ${formErrors.address ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'} rounded-xl focus:outline-none text-slate-500 text-sm h-20 resize-none font-medium italic`} 
                            />
                            {formErrors.address && <p className="text-rose-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} /> {formErrors.address}</p>}
                        </div>
                        
                        <div className="pt-2">
                            <MapSelector 
                                lat={formData.lat} 
                                lng={formData.lng} 
                                onChange={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))} 
                                onAddressChange={(address) => setFormData(prev => ({ ...prev, address }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button 
                        onClick={() => { setIsAddStoreOpen(false); setIsEditOpen(false); }}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={isAddStoreOpen ? handleCreate : handleUpdate}
                        className="px-10 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5"
                    >
                        {isAddStoreOpen ? 'Tạo cửa hàng' : 'Lưu thay đổi'}
                    </button>
                </div>
            </Modal>


            {/* Detail Store Modal */}
            <Modal 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)}
                title="Chi tiết cửa hàng"
            >
                <div className="space-y-5">
                    <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-2xl">
                            {selectedStore?.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">{selectedStore?.name}</h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 mt-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                <CheckCircle2 size={12} /> {selectedStore?.status}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Mô tả:</span>
                            <span className="font-medium text-slate-900">{selectedStore?.description || 'Không có mô tả'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Địa chỉ:</span>
                            <span className="font-medium text-slate-900">{selectedStore?.address}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Tọa độ:</span>
                            <span className="font-medium text-slate-900">{selectedStore?.lat}, {selectedStore?.lng}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Đối tác:</span>
                            <span className="font-medium text-slate-900">{selectedStore?.merchant?.businessName || 'N/A'}</span>
                        </div>
                    </div>

                    {/* === QR CODES === */}
                    {selectedStore && (
                        <div className="pt-4 border-t border-slate-100">
                            <QRManagement storeId={selectedStore.id} storeName={selectedStore.name} />
                        </div>
                    )}

                    {/* === NARRATIONS === */}
                    {selectedStore && (
                        <div className="pt-4 border-t border-slate-100">
                            <NarrationManagement storeId={selectedStore.id} storeName={selectedStore.name} />
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsDetailOpen(false)}
                            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors w-full"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StoreManagement;
