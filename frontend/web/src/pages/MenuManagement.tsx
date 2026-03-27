import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Edit2, Trash2, Search, Loader2, Store, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { merchantApi, menusApi } from '../utils/api';
import type { Menu, Store as StoreType } from '../types';

const MenuManagement: React.FC = () => {
    const { user } = useAuth();
    const [menus, setMenus] = useState<Menu[]>([]);
    const [myStores, setMyStores] = useState<StoreType[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        isAvailable: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const merchantData = (await merchantApi.getMe()) as any;
            const rawStores = (merchantData.stores || []) as StoreType[];
            // Deduplicate by ID
            const stores = Array.from(new Map(rawStores.map((s) => [s.id, s])).values());
            setMyStores(stores);
            
            if (stores.length > 0) {
                const storeId = selectedStoreId || stores[0].id;
                if (!selectedStoreId) setSelectedStoreId(storeId);
                
                const menuData = (await menusApi.getByStore(storeId)) as any;
                setMenus(menuData || []);
            }
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu menu:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user, selectedStoreId]);

    const handleCreate = async () => {
        if (!selectedStoreId) return;
        try {
            await menusApi.create(selectedStoreId, {
                ...formData,
                price: parseFloat(formData.price.replace(/[^\d]/g, '')) || 0,
            });
            setIsAddMenuOpen(false);
            resetForm();
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi tạo món ăn');
        }
    };

    const handleUpdate = async () => {
        if (!selectedMenu) return;
        try {
            await menusApi.update(selectedMenu.id, {
                ...formData,
                price: typeof formData.price === 'string' ? parseFloat(formData.price.replace(/[^\d]/g, '')) : formData.price,
            });
            setIsEditOpen(false);
            resetForm();
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi cập nhật món ăn');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa món ăn này?')) return;
        try {
            await menusApi.remove(id);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi xóa món ăn');
        }
    };

    const openEdit = (menu: Menu) => {
        setSelectedMenu(menu);
        setFormData({
            name: menu.name,
            price: String(menu.price),
            description: menu.description || '',
            imageUrl: menu.imageUrl || '',
            isAvailable: menu.isAvailable
        });
        setIsEditOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', price: '', description: '', imageUrl: '', isAvailable: true });
        setSelectedMenu(null);
    };

    const filteredMenu = menus.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        <Utensils className="text-amber-500 w-8 h-8" /> 
                        Thực đơn quán (Menu)
                    </h1>
                    <p className="text-slate-500">Quản lý danh sách các món ăn, đồ uống của quán.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsAddMenuOpen(true); }}
                    disabled={myStores.length === 0}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-primary-500/20 disabled:opacity-50"
                >
                    <Plus size={20} /> Thêm món mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm món ăn..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select 
                            value={selectedStoreId}
                            onChange={(e) => setSelectedStoreId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none"
                        >
                            {myStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            {myStores.length === 0 && <option value="">Chưa có cửa hàng</option>}
                        </select>
                    </div>
                </div>
            </div>

            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary-500" size={40} />
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenu.map(item => (
                        <div key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group overflow-hidden">
                            <div className="h-48 overflow-hidden relative">
                                <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(item)} className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-primary-600 rounded-lg shadow-sm transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-600 rounded-lg shadow-sm transition-colors"><Trash2 size={16} /></button>
                                </div>
                                {!item.isAvailable && (
                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                        <span className="px-3 py-1 bg-white text-slate-900 text-xs font-bold rounded-full uppercase">Hết hàng</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900 leading-tight text-lg group-hover:text-primary-600 transition-colors">{item.name}</h4>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 italic">
                                    {item.description || 'Không có mô tả cho món ăn này.'}
                                </p>
                                <div className="mt-auto flex justify-between items-center">
                                    <div className="text-primary-600 font-black text-xl">{formatCurrency(item.price)}</div>
                                    {item.isAvailable && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                            <CheckCircle2 size={12} /> Đang bán
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && filteredMenu.length === 0 && (
                    <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Utensils size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Thực đơn trống</h3>
                        <p className="text-slate-500 mt-1">Hãy thêm những món ăn hấp dẫn đầu tiên cho cửa hàng của bạn.</p>
                    </div>
                )}
            </div>

            {/* Add Menu Item Modal */}
            <Modal 
                isOpen={isAddMenuOpen} 
                onClose={() => setIsAddMenuOpen(false)}
                title="Thêm món ăn mới"
                maxWidth="max-w-xl"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên món ăn</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Nhập tên món ăn..." 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all font-medium" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá bán (VND)</label>
                            <input 
                                type="text" 
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                placeholder="35.000" 
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all font-bold text-primary-600" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Trạng thái</label>
                            <select 
                                value={formData.isAvailable ? 'true' : 'false'}
                                onChange={(e) => setFormData({...formData, isAvailable: e.target.value === 'true'})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all font-medium"
                            >
                                <option value="true">Còn hàng / Đang bán</option>
                                <option value="false">Hết hàng / Tạm ngưng</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả món ăn</label>
                        <textarea 
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Thành phần, hương vị đặc trưng..." 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all resize-none font-medium" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Link ảnh minh họa</label>
                        <input 
                            type="text" 
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            placeholder="https://images.unsplash.com/..." 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all" 
                        />
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => setIsAddMenuOpen(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleCreate}
                            className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all"
                        >
                            Thêm vào menu
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Menu Item Modal */}
            <Modal 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)}
                title="Chỉnh sửa món ăn"
                maxWidth="max-w-xl"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên món ăn</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all font-bold" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá bán (VND)</label>
                            <input 
                                type="text" 
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all font-black text-primary-600" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Trạng thái</label>
                            <select 
                                value={formData.isAvailable ? 'true' : 'false'}
                                onChange={(e) => setFormData({...formData, isAvailable: e.target.value === 'true'})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all font-bold"
                            >
                                <option value="true">Còn hàng / Đang bán</option>
                                <option value="false">Hết hàng / Tạm ngưng</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả chi tiết</label>
                        <textarea 
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all resize-none shadow-inner" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Cập nhật ảnh</label>
                        <input 
                            type="text" 
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            placeholder="Link ảnh mới..." 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all" 
                        />
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => setIsEditOpen(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleUpdate}
                            className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary-900 hover:bg-slate-900 shadow-lg shadow-slate-900/20 transition-all"
                        >
                            Cập nhật món
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MenuManagement;
