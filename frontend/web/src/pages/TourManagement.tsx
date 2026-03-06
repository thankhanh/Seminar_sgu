import React from 'react';
import { Share2, Plus, Search, Map as MapIcon, Calendar, ArrowRight } from 'lucide-react';

const TourManagement: React.FC = () => {
    const tours = [
        { id: 1, name: 'Hành trình Hải sản', steps: 5, time: '120 phút', active: true },
        { id: 2, name: 'Khám phá Ăn vặt đường phố', steps: 8, time: '90 phút', active: true },
        { id: 3, name: 'Night Market Experience', steps: 4, time: '60 phút', active: false },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý Tour</h1>
                    <p className="text-slate-500">Tạo và quản lý các lộ trình tham quan cho người dùng.</p>
                </div>
                <button className="bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20">
                    <Plus size={20} />
                    Tạo Tour mới
                </button>
            </div>

            <div className="space-y-4">
                {tours.map((tour) => (
                    <div key={tour.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-primary-200 transition-colors">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
                                <MapIcon size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{tour.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><Share2 size={16} /> {tour.steps} điểm dừng</span>
                                    <span className="flex items-center gap-1.5"><Calendar size={16} /> {tour.time}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${tour.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <div className={`w-2 h-2 rounded-full ${tour.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                <span className="text-[10px] font-bold uppercase">{tour.active ? 'Đang bật' : 'Đã tắt'}</span>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors">
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourManagement;
