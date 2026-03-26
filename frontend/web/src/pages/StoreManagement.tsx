import React, { useState } from 'react';
import { 
    Store as StoreIcon, Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
    MapPin, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

import { storesApi, merchantApi, adminApi } from '../utils/api';
import type { Store } from '../types';
import MapSelector from '../components/MapSelector';

const StoreManagement: React.FC = () => {
    const { user } = useAuth();
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [merchants, setMerchants] = useState<any[]>([]);

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
    });

    const fetchStores = async () => {
        setLoading(true);
        try {
            if (user?.role === 'admin') {
                const [storeRes, merchantRes] = await Promise.all([
                    storesApi.getAll(1, 100, 'all'),
                    adminApi.getMerchants()
                ]);
                setStores(storeRes.data || []);
                setMerchants(merchantRes.data || []);
            } else {
                const response = await merchantApi.getMe();
                setStores(response.stores || []);
            }
        } catch (err) {
            console.error('Lỗi khi lấy danh sách cửa hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (user) fetchStores();
    }, [user]);

    const handleCreate = async () => {
        try {
            await storesApi.create(formData);
            alert('Thêm cửa hàng thành công!');
            setIsAddStoreOpen(false);
            fetchStores();
        } catch (err) {
            alert('Lỗi khi tạo cửa hàng');
        }
    };

    const handleUpdate = async () => {
        if (!selectedStore) return;
        try {
            await storesApi.update(selectedStore.id, formData);
            alert('Cập nhật thông tin thành công!');
            setIsEditOpen(false);
            fetchStores();
        } catch (err) {
            alert('Lỗi khi cập nhật cửa hàng');
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
        });
        setIsEditOpen(true);
    };

    const filteredStores = stores.filter((store: Store) => 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <button 
                    onClick={() => setIsAddStoreOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-primary-500/20"
                >
                    <Plus size={20} />
                    <span>Thêm cửa hàng</span>
                </button>
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
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                                {store.name.charAt(0)}
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
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Hiển thị {filteredStores.length} kết quả</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Trước</button>
                        <button className="px-3 py-1 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg text-sm font-bold">1</button>
                        <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Sau</button>
                    </div>
                </div>
            </div>

            {/* Add Store Modal */}
            <Modal 
                isOpen={isAddStoreOpen} 
                onClose={() => setIsAddStoreOpen(false)}
                title="Thêm cửa hàng mới"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tên cửa hàng/POI</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nhập tên cửa hàng..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ</label>
                        <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Địa chỉ chi tiết..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chọn vị trí trên bản đồ</label>
                        <MapSelector 
                            lat={formData.lat} 
                            lng={formData.lng} 
                            onChange={(lat, lng) => setFormData({ ...formData, lat, lng })} 
                            onAddressChange={(address) => setFormData(prev => ({ ...prev, address }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Vĩ độ (Lat)</label>
                            <input type="number" step="any" value={formData.lat} onChange={e => setFormData({...formData, lat: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Kinh độ (Lng)</label>
                            <input type="number" step="any" value={formData.lng} onChange={e => setFormData({...formData, lng: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Giờ mở cửa</label>
                            <input type="time" value={formData.openTime} onChange={e => setFormData({...formData, openTime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Giờ đóng cửa</label>
                            <input type="time" value={formData.closeTime} onChange={e => setFormData({...formData, closeTime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Link ảnh bìa</label>
                        <input type="text" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Mô tả về địa điểm..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 h-24" />
                    </div>
                    {user?.role === 'admin' && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Chủ sở hữu (Merchant)</label>
                                <select 
                                    value={formData.merchantId} 
                                    onChange={e => setFormData({...formData, merchantId: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900"
                                >
                                    <option value="">-- Chọn đối tác --</option>
                                    {merchants.map(m => (
                                        <option key={m.id} value={m.id}>{m.businessName} ({m.user?.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Trạng thái</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900">
                                    <option value="pending">Chờ duyệt (Pending)</option>
                                    <option value="active">Hoạt động (Active)</option>
                                    <option value="hidden">Ẩn (Hidden)</option>
                                </select>
                            </div>
                        </>
                    )}
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsAddStoreOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleCreate}
                            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all"
                        >
                            Tạo cửa hàng
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Store Modal */}
            <Modal 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)}
                title="Chỉnh sửa cửa hàng"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tên cửa hàng</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Tên cửa hàng..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Vĩ độ (Lat)</label>
                            <input type="number" step="any" value={formData.lat} onChange={e => setFormData({...formData, lat: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Kinh độ (Lng)</label>
                            <input type="number" step="any" value={formData.lng} onChange={e => setFormData({...formData, lng: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Giờ mở cửa</label>
                            <input type="time" value={formData.openTime} onChange={e => setFormData({...formData, openTime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Giờ đóng cửa</label>
                            <input type="time" value={formData.closeTime} onChange={e => setFormData({...formData, closeTime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Link ảnh bìa</label>
                        <input type="text" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ</label>
                        <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chọn vị trí trên bản đồ</label>
                        <MapSelector 
                            lat={formData.lat} 
                            lng={formData.lng} 
                            onChange={(lat, lng) => setFormData({ ...formData, lat, lng })} 
                            onAddressChange={(address) => setFormData(prev => ({ ...prev, address }))}
                        />
                    </div>
                    {user?.role === 'admin' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Trạng thái</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                                <option value="pending">Chờ duyệt (Pending)</option>
                                <option value="active">Hoạt động (Active)</option>
                                <option value="hidden">Ẩn (Hidden)</option>
                            </select>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsEditOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleUpdate}
                            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all"
                        >
                            Lưu thông tin
                        </button>
                    </div>
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
