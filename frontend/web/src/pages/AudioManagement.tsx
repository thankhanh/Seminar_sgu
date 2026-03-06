import React from 'react';
import { Mic, CloudUpload, Play, MoreVertical } from 'lucide-react';

const AudioManagement: React.FC = () => {
    const audioFiles = [
        { id: 1, title: 'Giới thiệu về Phố Vinh Khánh', duration: '03:45', voice: 'Nam - Miền Nam', status: 'Đã xuất bản' },
        { id: 2, title: 'Lịch sử món Ốc Oanh', duration: '02:20', voice: 'Nữ - Miền Nam', status: 'Đã xuất bản' },
        { id: 3, title: 'Câu chuyện Bánh Khọt Cô Ba', duration: '01:50', voice: 'Nữ - Miền Bắc', status: 'Bản nháp' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý Audio</h1>
                    <p className="text-slate-500">Hệ thống âm thanh thuyết minh và kể chuyện (Storytelling).</p>
                </div>
                <button className="bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20">
                    <CloudUpload size={20} />
                    Tải lên Audio mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audioFiles.map((file) => (
                    <div key={file.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Mic size={24} />
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">{file.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                            <span className="flex items-center gap-1"><Play size={14} /> {file.duration}</span>
                            <span>•</span>
                            <span>{file.voice}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${file.status === 'Đã xuất bản' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                {file.status}
                            </span>
                            <button className="text-primary-600 font-bold text-sm hover:underline">Nghe thử</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AudioManagement;
