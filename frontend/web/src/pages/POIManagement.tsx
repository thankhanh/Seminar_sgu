import React from 'react';
import { MapPin, Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';

const POIManagement: React.FC = () => {
    const poiData = [
        { id: 1, name: 'Ốc Oanh', category: 'Hải sản', location: 'Khu B - Gian 04', status: 'Hoạt động' },
        { id: 2, name: 'Bánh Khọt Cô Ba', category: 'Ăn vặt', location: 'Khu A - Gian 12', status: 'Hoạt động' },
        { id: 3, name: 'Trà Sữa Nhà Làm', category: 'Đồ uống', location: 'Khu C - Gian 01', status: 'Tạm nghỉ' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý POI</h1>
                    <p className="text-slate-500">Quản lý các điểm tham quan và gian hàng trên bản đồ.</p>
                </div>
                <button className="bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20">
                    <Plus size={20} />
                    Thêm POI mới
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                        <Search size={18} className="text-slate-400" />
                        <input type="text" placeholder="Tìm kiếm POI..." className="bg-transparent border-none outline-none text-sm w-full" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        <Filter size={18} />
                        Lọc
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Tên POI</th>
                                <th className="px-6 py-4 font-bold">Danh mục</th>
                                <th className="px-6 py-4 font-bold">Vị trí</th>
                                <th className="px-6 py-4 font-bold">Trạng thái</th>
                                <th className="px-6 py-4 font-bold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {poiData.map((poi) => (
                                <tr key={poi.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                                                <MapPin size={20} />
                                            </div>
                                            <span className="font-bold text-slate-900">{poi.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{poi.category}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{poi.location}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${poi.status === 'Hoạt động' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {poi.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors"><Edit2 size={18} /></button>
                                            <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default POIManagement;
