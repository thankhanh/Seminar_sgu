import React, { useState } from 'react';
import { Share2, Plus, Search, Map as MapIcon, ArrowRight, Edit2, Trash2, Clock } from 'lucide-react';

const MOCK_TOURS = [
    { id: 1, name: 'Hành trình Hải sản', steps: 5, time: '120 phút', active: true, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop' },
    { id: 2, name: 'Khám phá Ăn vặt', steps: 8, time: '90 phút', active: true, image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=300&h=200&fit=crop' },
    { id: 3, name: 'Trải nghiệm Chợ đêm', steps: 4, time: '60 phút', active: false, image: 'https://images.unsplash.com/photo-1541658016709-815ce70e1cbb?w=300&h=200&fit=crop' },
];

const TourManagement: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTours = MOCK_TOURS.filter(tour => 
        tour.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý Tour</h1>
                    <p className="text-slate-500">Tạo và quản lý các lộ trình tham quan cho người dùng.</p>
                </div>
                <button className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-sm shadow-primary-500/20">
                    <Plus size={20} />
                    Tạo Tour mới
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tour tham quan..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTours.map((tour) => (
                    <div key={tour.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                        <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                            {tour.image ? (
                                <img src={tour.image} alt={tour.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <MapIcon size={40} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-rose-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${tour.active ? 'bg-emerald-500/80 text-white' : 'bg-slate-900/60 text-white'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${tour.active ? 'bg-white' : 'bg-slate-400'}`}></div>
                                    {tour.active ? 'Đang bật' : 'Đã tắt'}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{tour.name}</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                                        <MapIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-0.5">Lộ trình</div>
                                        <div className="font-bold text-slate-900 text-sm">{tour.steps} điểm dừng</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-0.5">Thời lượng</div>
                                        <div className="font-bold text-slate-900 text-sm">{tour.time}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <button className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                                    <Share2 size={18} /> Chia sẻ
                                </button>
                                <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-600 transition-colors">
                                    Chi tiết <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourManagement;
