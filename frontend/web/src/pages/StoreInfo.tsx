import React, { useState } from 'react';
import { Camera, Save, MapPin, Phone, Mail, Clock, Info } from 'lucide-react';

const StoreInfo: React.FC = () => {
    const [storeInfo, setStoreInfo] = useState({
        name: 'Bún Bò Huế Chợ Cũ',
        address: 'Gian hàng 02, Khu A, Phố ẩm thực Vĩnh Khánh',
        phone: '0901234567',
        email: 'lienhe@bunbohuechocu.vn',
        openTime: '06:00 - 22:00',
        description: 'Quán ăn lâu đời với hương vị gia truyền từ xứ Huế. Mang đến trải nghiệm ẩm thực đậm đà bản sắc miền Trung giữa lòng Sài Gòn.'
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            {/* Header Content */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                    Hồ sơ Cửa hàng
                </h1>
                <p className="text-slate-500 text-base">Tùy chỉnh giao diện và thông tin hiển thị của quán trên hệ thống.</p>
            </div>

            {/* Premium Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
                {/* Cover Banner */}
                <div className="h-64 sm:h-80 w-full relative group cursor-pointer bg-slate-100">
                    <img 
                        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop" 
                        alt="Store Cover" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
                            <Camera size={32} className="text-white" />
                        </div>
                        <span className="ml-3 text-white font-bold text-lg tracking-wide shadow-sm">Thay đổi ảnh bìa</span>
                    </div>
                </div>

                <div className="px-6 sm:px-10 pb-10 relative">
                    {/* Floating Avatar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-20 mb-8 z-10 relative">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full p-1.5 shadow-2xl shadow-slate-900/10">
                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                    <img 
                                        src="https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=400&h=400&fit=crop" 
                                        alt="Store Avatar" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="mb-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 sm:mt-0 flex w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5">
                                <Save size={20} /> Lưu thông tin
                            </button>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Primary Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-1.5">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Info className="text-primary-500" /> Thông tin cơ bản
                                </h2>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Tên cửa hàng / Quán ăn</label>
                                    <input type="text" value={storeInfo.name} onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-bold text-lg transition-all shadow-sm" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Mô tả giới thiệu</label>
                                    <textarea rows={4} value={storeInfo.description} onChange={(e) => setStoreInfo({...storeInfo, description: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-700 leading-relaxed resize-none transition-all shadow-sm"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Meta */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin className="text-primary-500" /> Liên hệ & Vị trí
                            </h2>
                            <div className="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Vị trí lô/gian hàng</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500/70" size={20} />
                                        <input type="text" value={storeInfo.address} onChange={(e) => setStoreInfo({...storeInfo, address: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-medium shadow-sm transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Số điện thoại</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500/70" size={20} />
                                        <input type="text" value={storeInfo.phone} onChange={(e) => setStoreInfo({...storeInfo, phone: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-medium shadow-sm transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Email liên hệ</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500/70" size={20} />
                                        <input type="email" value={storeInfo.email} onChange={(e) => setStoreInfo({...storeInfo, email: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-medium shadow-sm transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Giờ mở cửa</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500/70" size={20} />
                                        <input type="text" value={storeInfo.openTime} onChange={(e) => setStoreInfo({...storeInfo, openTime: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-medium shadow-sm transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreInfo;
