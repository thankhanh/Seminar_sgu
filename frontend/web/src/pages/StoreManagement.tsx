import React, { useState } from 'react';
import { 
    Store, Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
    MapPin, Phone, Mail, CheckCircle2, XCircle
} from 'lucide-react';

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
    const [stores, setStores] = useState(MOCK_STORES);
    const [searchQuery, setSearchQuery] = useState('');

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
                <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-primary-500/20">
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
                                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Chỉnh sửa">
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                                                <Trash2 size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Khác">
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
        </div>
    );
};

export default StoreManagement;
