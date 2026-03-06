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
                    <div className="space-y-3">
                        {['Tiếng Việt', 'Tiếng Anh', 'Tiếng Trung', 'Tiếng Hàn'].map((lang, i) => (
                            <div key={lang} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                <span className="text-sm font-medium text-slate-700">{lang}</span>
                                <span className="text-xs text-slate-400">{i === 0 ? 'Mặc định' : '98% Hoàn thành'}</span>
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
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="text-sm text-slate-900 font-medium line-clamp-1">Admin Hung đã cập nhật POI: Ốc Oanh</p>
                                    <span className="text-xs text-slate-400">10 phút trước</span>
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
