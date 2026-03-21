import React, { useState } from 'react';
import { Mic, CloudUpload, Play, MoreVertical, Headphones, Clock, Edit2, Trash2, Search } from 'lucide-react';

const MOCK_AUDIO = [
    { id: 1, title: 'Giới thiệu về Phố Vinh Khánh', duration: '03:45', voice: 'Nam - Miền Nam', status: 'Đã xuất bản', plays: '1.2k', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop' },
    { id: 2, title: 'Lịch sử món Ốc Oanh', duration: '02:20', voice: 'Nữ - Miền Nam', status: 'Đã xuất bản', plays: '856', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=100&h=100&fit=crop' },
    { id: 3, title: 'Câu chuyện Bánh Khọt Cô Ba', duration: '01:50', voice: 'Nữ - Miền Bắc', status: 'Bản nháp', plays: '-', image: 'https://images.unsplash.com/photo-1541658016709-815ce70e1cbb?w=100&h=100&fit=crop' },
];

const AudioManagement: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAudio = MOCK_AUDIO.filter(audio => 
        audio.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý Audio</h1>
                    <p className="text-slate-500">Hệ thống âm thanh thuyết minh và kể chuyện (Storytelling).</p>
                </div>
                <button className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-sm shadow-primary-500/20">
                    <CloudUpload size={20} />
                    Tải lên Audio
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm audio, giọng đọc..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAudio.map((file) => (
                    <div key={file.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex gap-4 items-start mb-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden relative shadow-sm">
                                <img src={file.image} alt={file.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play size={20} className="text-white fill-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2" title={file.title}>{file.title}</h3>
                                <div className="text-xs text-primary-600 font-medium">{file.voice}</div>
                            </div>
                            <button className="text-slate-400 hover:text-slate-900 transition-colors p-1">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" />
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Thời lượng</div>
                                    <div className="text-sm font-semibold text-slate-900">{file.duration}</div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
                                <Headphones size={16} className="text-slate-400" />
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Lượt nghe</div>
                                    <div className="text-sm font-semibold text-slate-900">{file.plays}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${file.status === 'Đã xuất bản' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {file.status}
                            </span>
                            <div className="flex gap-1">
                                <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Sửa">
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AudioManagement;
