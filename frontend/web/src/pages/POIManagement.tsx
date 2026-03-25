import React, { useState } from 'react';
import { MapPin, Search, Plus, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const MOCK_POI_DATA = [
    { id: 1, name: 'Ốc Oanh', category: 'Hải sản', location: 'Khu B - Gian 04', status: 'Hoạt động', reviews: '4.8 (1.2k)', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&h=150&fit=crop' },
    { id: 2, name: 'Bánh Khọt Cô Ba', category: 'Ăn vặt', location: 'Khu A - Gian 12', status: 'Hoạt động', reviews: '4.5 (856)', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=150&h=150&fit=crop' },
    { id: 3, name: 'Trà Sữa Nhà Làm', category: 'Đồ uống', location: 'Khu C - Gian 01', status: 'Tạm nghỉ', reviews: '4.2 (320)', image: 'https://images.unsplash.com/photo-1541658016709-15ce70e1cbb?w=150&h=150&fit=crop' },
    { id: 4, name: 'Bún Bò Huế Chợ Cũ', category: 'Ăn chính', location: 'Khu A - Gian 02', status: 'Hoạt động', reviews: '4.9 (2.1k)', image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?w=150&h=150&fit=crop' },
];

const POIManagement: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddPoiOpen, setIsAddPoiOpen] = useState(false);
    
    const filteredPOI = MOCK_POI_DATA.filter(poi => 
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        poi.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý POI</h1>
                    <p className="text-slate-500">Quản lý các điểm tham quan và gian hàng trên bản đồ.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                        <Filter size={18} />
                        Bộ lọc
                    </button>
                    <button 
                        onClick={() => setIsAddPoiOpen(true)}
                        className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-sm shadow-primary-500/20"
                    >
                        <Plus size={20} />
                        Thêm điểm mới
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm danh thắng, món ăn..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        <Filter size={18} />
                        Lọc
                    </button>
                </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="px-6 py-4 font-semibold">Tên POI</th>
                                <th className="px-6 py-4 font-semibold">Danh mục</th>
                                <th className="px-6 py-4 font-semibold">Vị trí</th>
                                <th className="px-6 py-4 font-semibold">Đánh giá</th>
                                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPOI.map((poi) => (
                                <tr key={poi.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden shadow-sm">
                                                {poi.image ? (
                                                    <img src={poi.image} alt={poi.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src="https://via.placeholder.com/150" alt="Placeholder" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{poi.name}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">ID: {poi.id.toString().padStart(4, '0')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-600">{poi.category}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-slate-600 text-sm">
                                            <MapPin size={16} className="text-slate-400" />
                                            {poi.location}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {poi.reviews}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium uppercase ${poi.status === 'Hoạt động' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {poi.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            <button className="p-2 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Sửa"><Edit2 size={18} /></button>
                                            <button className="p-2 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa"><Trash2 size={18} /></button>
                                            <button className="p-2 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Thêm"><MoreVertical size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPOI.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Không tìm thấy điểm đến nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Hiển thị {filteredPOI.length} kết quả</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Trước</button>
                        <button className="px-3 py-1 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg text-sm font-bold">1</button>
                        <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Sau</button>
                    </div>
                </div>
            </div>

            {/* Add POI Modal */}
            <Modal 
                isOpen={isAddPoiOpen} 
                onClose={() => setIsAddPoiOpen(false)}
                title="Thêm điểm POI mới"
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tên địa điểm (POI)</label>
                        <input type="text" placeholder="Nhập tên điểm dừng..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Loại POI</label>
                            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                                <option>Gian hàng (Store)</option>
                                <option>Khu vực chung</option>
                                <option>Điểm check-in</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Thuộc Cửa hàng (Tùy chọn)</label>
                            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                                <option>Không thuộc cửa hàng nào</option>
                                <option>Ốc Oanh</option>
                                <option>Bánh Khọt Cô Ba</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tọa độ Latitude</label>
                            <input type="text" placeholder="Ví dụ: 10.762622" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tọa độ Longitude</label>
                            <input type="text" placeholder="Ví dụ: 106.660172" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả ngắn</label>
                        <textarea rows={3} placeholder="Mô tả về địa điểm này..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 resize-none"></textarea>
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsAddPoiOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={() => setIsAddPoiOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all"
                        >
                            Lưu thông tin
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default POIManagement;
