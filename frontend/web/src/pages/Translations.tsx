import React, { useState } from 'react';
import { History, Download, Globe } from 'lucide-react';
import Modal from '../components/Modal';

const Translations: React.FC = () => {
    const [isAddLangOpen, setIsAddLangOpen] = useState(false);
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
                        <button onClick={() => setIsAddLangOpen(true)} className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline transition-all">+ Thêm ngôn ngữ</button>
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

            {/* Add Language Modal */}
            <Modal 
                isOpen={isAddLangOpen} 
                onClose={() => setIsAddLangOpen(false)}
                title="Thêm ngôn ngữ mới"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Chọn ngôn ngữ</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                            <option>Tiếng Nhật (Japanese)</option>
                            <option>Tiếng Pháp (French)</option>
                            <option>Tiếng Đức (German)</option>
                            <option>Tiếng Thái (Thai)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Kích hoạt tự động dịch</label>
                        <div className="flex items-start gap-3 mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <input type="checkbox" id="autoTranslate" defaultChecked className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500" />
                            <label htmlFor="autoTranslate" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                                Sử dụng AI để tự động dịch các nội dung hiện tại (POI, Audio, thông tin quán...) sang ngôn ngữ mới này.
                            </label>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsAddLangOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={() => setIsAddLangOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all"
                        >
                            Thêm ngôn ngữ
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Translations;
