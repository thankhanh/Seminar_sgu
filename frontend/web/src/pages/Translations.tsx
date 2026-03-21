import React from 'react';
import { Languages, History, Search, Download, Globe } from 'lucide-react';

const Translations: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Bản dịch & Lịch sử</h1>
                <p className="text-slate-500">Quản lý nội dung đa ngôn ngữ và lịch sử sử dụng hệ thống.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Globe size={20} /></div>
                            <h3 className="font-bold text-slate-900">Quản lý ngôn ngữ</h3>
                        </div>
                        <button className="text-sm font-bold text-primary-600">+ Thêm ngôn ngữ</button>
                    </div>
                    <div className="space-y-4">
                        {[{lang: 'Tiếng Việt', pct: 100}, {lang: 'Tiếng Anh', pct: 98}, {lang: 'Tiếng Trung', pct: 45}, {lang: 'Tiếng Hàn', pct: 12}].map((item, i) => (
                            <div key={item.lang} className="p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-sm transition-all bg-slate-50/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate-900">{item.lang}</span>
                                    <span className="text-xs font-semibold text-primary-600">{i === 0 ? 'Mặc định' : `${item.pct}%`}</span>
                                </div>
                                {i !== 0 && (
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${item.pct}%` }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><History size={20} /></div>
                            <h3 className="font-bold text-slate-900">Lịch sử hệ thống</h3>
                        </div>
                        <Download size={20} className="text-slate-400 cursor-pointer" />
                    </div>
                    <div className="space-y-0 relative before:absolute before:top-4 before:bottom-4 before:left-[11px] before:w-[2px] before:bg-slate-100">
                        {[
                            { title: 'Cập nhật POI: Ốc Oanh', time: '10 phút trước', user: 'Admin Hung', color: 'primary' },
                            { title: 'Tạo Tour: Khám phá ăn vặt', time: '2 giờ trước', user: 'Manager Hoa', color: 'emerald' },
                            { title: 'Thêm bản dịch Tiếng Anh cho Bánh Khọt', time: 'Hôm qua, 14:30', user: 'Admin Hung', color: 'indigo' }
                        ].map((item, i) => (
                            <div key={i} className="relative pl-8 py-4 group">
                                <div className={`absolute left-0 top-5 w-6 h-6 rounded-full bg-white border-4 border-${item.color}-100 flex items-center justify-center`}>
                                    <div className={`w-2 h-2 rounded-full bg-${item.color}-500 group-hover:scale-150 transition-transform`}></div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 group-hover:border-slate-200 transition-colors">
                                    <p className="text-sm text-slate-900 font-bold mb-1">{item.title}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="font-medium text-slate-700">{item.user}</span>
                                        <span>•</span>
                                        <span>{item.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Translations;
