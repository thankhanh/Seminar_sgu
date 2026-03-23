import React, { useState } from 'react';
import { Utensils, Plus, Tag, Edit2, Trash2, Camera, Search, Filter } from 'lucide-react';
import Modal from '../components/Modal';

const MOCK_MENU = [
    { id: 1, name: 'Bánh bèo tôm cháy', price: '35,000 ₫', category: 'Khai vị', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=100&h=100&fit=crop' },
    { id: 2, name: 'Bún bò Huế đặc biệt', price: '65,000 ₫', category: 'Món chính', image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?w=100&h=100&fit=crop' },
];

const MenuManagement: React.FC = () => {
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMenu = MOCK_MENU.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    onClick={() => setIsAddMenuOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-primary-500/20"
                >
                    <Plus size={20} /> Thêm món mới
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm món ăn..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                    <Filter size={18} />
                    Lọc
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenu.map(item => (
                        <div key={item.id} className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all group overflow-hidden">
                            <div className="h-40 overflow-hidden relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setIsEditOpen(true)} className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-primary-600 rounded-lg shadow-sm transition-colors"><Edit2 size={16} /></button>
                                    <button className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-600 rounded-lg shadow-sm transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900 leading-tight text-lg">{item.name}</h4>
                                </div>
                                <div className="flex items-center gap-1.5 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    <Tag size={12} className="text-primary-500" /> {item.category}
                                </div>
                                <div className="mt-auto flex justify-between items-end">
                                    <div className="text-primary-600 font-black text-xl">{item.price}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredMenu.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Không tìm thấy món ăn nào phù hợp.
                    </div>
                )}
            </div>

            {/* Menu Item Modal */}
            <Modal 
                isOpen={isAddMenuOpen} 
                onClose={() => setIsAddMenuOpen(false)}
                title="Thêm món ăn mới"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tên món ăn</label>
                        <input type="text" placeholder="Nhập tên món ăn..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Giá bán</label>
                            <input type="text" placeholder="Ví dụ: 35.000" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Phân loại</label>
                            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                                <option>Khai vị</option>
                                <option>Món chính</option>
                                <option>Đồ uống</option>
                                <option>Tráng miệng</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Ảnh minh họa</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                            <div className="space-y-1 text-center">
                                <Camera className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">Tải ảnh lên</span>
                                    <p className="pl-1">hoặc kéo thả vào đây</p>
                                </div>
                                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsAddMenuOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={() => setIsAddMenuOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all"
                        >
                            Lưu thao tác
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Menu Item Modal */}
            <Modal 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)}
                title="Chỉnh sửa món ăn"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tên món ăn</label>
                        <input type="text" defaultValue="Bánh bèo tôm cháy" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Giá bán</label>
                            <input type="text" defaultValue="35.000" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Phân loại</label>
                            <select defaultValue="Khai vị" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                                <option>Khai vị</option>
                                <option>Món chính</option>
                                <option>Đồ uống</option>
                                <option>Tráng miệng</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Ảnh minh họa</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                            <div className="space-y-1 text-center">
                                <Camera className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">Tải ảnh lên (Mới)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsEditOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={() => setIsEditOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MenuManagement;
