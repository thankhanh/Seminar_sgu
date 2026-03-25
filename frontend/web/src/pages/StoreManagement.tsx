import React, { useState } from 'react';
import { 
    Store, Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
    MapPin, Phone, Mail, CheckCircle2, XCircle
} from 'lucide-react';
import Modal from '../components/Modal';

// Mock data
const MOCK_STORES = [
    {
        id: '1',
        name: 'Cửa hàng Mẹ và Bé',
        owner: 'Nguyễn Thị Hoa',
        phone: '0901234567',
        email: 'hoa.nguyen@example.com',
        location: 'Tầng 1 - Khu A',
        status: 'active',
        revenue: '45,000,000 ₫'
    },
    {
        id: '2',
        name: 'Thời trang Hàn Quốc',
        owner: 'Trần Văn Minh',
        phone: '0912345678',
        email: 'minh.tran@example.com',
        location: 'Tầng 2 - Khu B',
        status: 'active',
        revenue: '32,500,000 ₫'
    },
    {
        id: '3',
        name: 'Ăn vặt Cô Mười',
        owner: 'Lê Thị Mười',
        phone: '0987654321',
        email: 'comuoi@example.com',
        location: 'Tầng trệt - Khu Ẩm thực',
        status: 'inactive',
        revenue: '12,000,000 ₫'
    },
    {
        id: '4',
        name: 'Đồ chơi Trẻ Em',
        owner: 'Phạm Đức Anh',
        phone: '0976543210',
        email: 'ducanh@example.com',
        location: 'Tầng 1 - Khu C',
        status: 'active',
        revenue: '28,400,000 ₫'
    }
];

const StoreManagement: React.FC = () => {
    const [stores] = useState(MOCK_STORES);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const filteredStores = stores.filter(store => 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        store.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Store className="text-primary-500" />
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
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="px-6 py-4 font-semibold">Tên cửa hàng</th>
                                <th className="px-6 py-4 font-semibold">Chủ sở hữu & Liên hệ</th>
                                <th className="px-6 py-4 font-semibold">Vị trí</th>
                                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold">Doanh thu (Tháng)</th>
                                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredStores.map((store) => (
                                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                                {store.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{store.name}</div>
                                                <div className="text-xs text-slate-500">ID: ST-{store.id.padStart(4, '0')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{store.owner}</div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Phone size={12} /> {store.phone}</span>
                                            <span className="flex items-center gap-1"><Mail size={12} /> {store.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <MapPin size={16} className="text-slate-400" />
                                            {store.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {store.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <CheckCircle2 size={14} /> Hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                <XCircle size={14} /> Tạm khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{store.revenue}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setIsEditOpen(true)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Chỉnh sửa">
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                                                <Trash2 size={18} />
                                            </button>
                                            <button onClick={() => setIsDetailOpen(true)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Chi tiết">
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
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tên cửa hàng</label>
                        <input type="text" placeholder="Nhập tên cửa hàng..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Chủ sở hữu</label>
                        <input type="text" placeholder="Họ và tên chủ sở hữu..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
                            <input type="text" placeholder="Ví dụ: 0901234567" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email liên hệ</label>
                            <input type="email" placeholder="example@gmail.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Vị trí gian hàng</label>
                        <input type="text" placeholder="Ví dụ: Tầng 1 - Khu A" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsAddStoreOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={() => setIsAddStoreOpen(false)}
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
                        <input type="text" defaultValue="Cửa hàng Mẹ và Bé" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Chủ sở hữu</label>
                        <input type="text" defaultValue="Nguyễn Thị Hoa" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
                            <input type="text" defaultValue="0901234567" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email liên hệ</label>
                            <input type="email" defaultValue="hoa.nguyen@example.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Vị trí gian hàng</label>
                        <input type="text" defaultValue="Tầng 1 - Khu A" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
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
                            C
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Cửa hàng Mẹ và Bé</h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 mt-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                <CheckCircle2 size={12} /> Đang hoạt động
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Chủ sở hữu:</span>
                            <span className="font-medium text-slate-900">Nguyễn Thị Hoa</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Số ĐT:</span>
                            <span className="font-medium text-slate-900">0901234567</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Email:</span>
                            <span className="font-medium text-slate-900">hoa.nguyen@example.com</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Vị trí:</span>
                            <span className="font-medium text-slate-900">Tầng 1 - Khu A</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm pt-4 border-t border-slate-100">
                            <span className="font-semibold text-slate-500">Tổng doanh thu:</span>
                            <span className="font-bold text-primary-600">45,000,000 ₫</span>
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
