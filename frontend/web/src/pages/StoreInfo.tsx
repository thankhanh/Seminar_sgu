import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, MapPin, Info, Loader2, CheckCircle2, QrCode, Download, RefreshCw } from 'lucide-react';
import { merchantApi, storesApi, qrApi, uploadApi } from '../utils/api';
import MapSelector from '../components/MapSelector';

interface StoreForm {
    id: string;
    name: string;
    address: string;
    description: string;
    lat: number | string;
    lng: number | string;
    openTime: string;
    closeTime: string;
    coverImage: string;
    status: string;
}

interface QrCodeData {
    id: string;
    qrImageUrl: string;
    isActive: boolean;
    createdAt: string;
}

const StoreInfo: React.FC = () => {
    const [stores, setStores] = useState<StoreForm[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const [storeForm, setStoreForm] = useState<StoreForm>({
        id: '', name: '', address: '', description: '', lat: '', lng: '',
        openTime: '08:00', closeTime: '22:00', coverImage: '', status: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !storeForm.id) return;

        setCoverUploading(true);
        try {
            const result = await uploadApi.uploadFile(file);
            const newUrl = result.url;

            // Gọi API update ngay → backend tự xóa file ảnh bìa cũ
            await storesApi.update(storeForm.id, { coverImage: newUrl });

            setStoreForm(prev => ({ ...prev, coverImage: newUrl }));
            // Cập nhật lại danh sách stores local
            setStores(prev => prev.map(s => s.id === storeForm.id ? { ...s, coverImage: newUrl } : s));
        } catch (err: any) {
            alert(err.message || 'Lỗi khi thay đổi ảnh bìa');
        } finally {
            setCoverUploading(false);
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    // QR Code state
    const [qrCodes, setQrCodes] = useState<QrCodeData[]>([]);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrGenerating, setQrGenerating] = useState(false);

    const fetchQr = async (storeId: string) => {
        if (!storeId) return;
        setQrLoading(true);
        try {
            const result = await qrApi.getByStore(storeId);
            setQrCodes(Array.isArray(result) ? result : []);
        } catch {
            setQrCodes([]);
        } finally {
            setQrLoading(false);
        }
    };

    const fetchStores = async () => {
        setLoading(true);
        try {
            const merchant = await merchantApi.getMe();
            const rawStores = merchant.stores || [];
            // Deduplicate by ID
            const uniqueRawStores = Array.from(new Map(rawStores.map((s: any) => [s.id, s])).values());
            
            const myStores: StoreForm[] = uniqueRawStores.map((s: any) => ({
                id: s.id,
                name: s.name,
                address: s.address || '',
                description: s.description || '',
                lat: s.lat ?? '',
                lng: s.lng ?? '',
                openTime: (s.openTime || '08:00').substring(0, 5),
                closeTime: (s.closeTime || '22:00').substring(0, 5),
                coverImage: s.coverImage || '',
                status: s.status || '',
            }));
            
            setStores(myStores);
            if (myStores.length > 0) {
                // Determine which store to show (either the one already selected, or the first one)
                setStoreForm((prevForm) => {
                    const currentId = prevForm.id || selectedStoreId || myStores[0].id;
                    const latest = myStores.find(s => s.id === currentId) || myStores[0];
                    setSelectedStoreId(latest.id);
                    return latest;
                });
            }
        } catch (err) {
            console.error('Lỗi khi tải thông tin cửa hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    // Load QR khi storeForm.id thay đổi
    useEffect(() => {
        if (storeForm.id) fetchQr(storeForm.id);
    }, [storeForm.id]);

    const handleGenerateQr = async () => {
        if (!storeForm.id) return;
        setQrGenerating(true);
        try {
            await qrApi.create(storeForm.id);
            await fetchQr(storeForm.id);
        } catch (err: any) {
            alert(err.message || 'Lỗi khi tạo QR code');
        } finally {
            setQrGenerating(false);
        }
    };

    const handleDownloadQr = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-${storeForm.name || 'store'}.png`;
        link.target = '_blank';
        link.click();
    };

    const handleSelectStore = (id: string) => {
        const store = stores.find(s => s.id === id);
        if (store) {
            setSelectedStoreId(id);
            setStoreForm(store);
            fetchQr(id);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            console.log('Saving store info:', storeForm.id, {
                name: storeForm.name,
                address: storeForm.address,
                lat: storeForm.lat,
                lng: storeForm.lng
            });
            await storesApi.update(storeForm.id, {
                name: storeForm.name,
                address: storeForm.address,
                description: storeForm.description,
                lat: Number(storeForm.lat) || 0,
                lng: Number(storeForm.lng) || 0,
                openTime: storeForm.openTime,
                closeTime: storeForm.closeTime,
                coverImage: storeForm.coverImage,
            });
            setSaved(true);
            alert('Cập nhật thông tin thành công!');
            await fetchStores();
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            alert(err.message || 'Lỗi khi lưu thông tin');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary-500" size={48} />
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Hồ sơ Cửa hàng</h1>
                    <p className="text-slate-500">Tùy chỉnh giao diện và thông tin hiển thị của quán trên hệ thống.</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4 items-start">
                    <div className="text-amber-600 text-2xl">⚠️</div>
                    <div>
                        <h3 className="font-bold text-amber-800 mb-1">Chưa có cửa hàng nào</h3>
                        <p className="text-amber-700 text-sm">Bạn chưa có cửa hàng nào trong hệ thống. Hãy liên hệ admin để được tạo cửa hàng hoặc tạo mới trong mục Quản lý Cửa hàng/POI.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Hồ sơ Cửa hàng</h1>
                    <p className="text-slate-500 text-base">Tùy chỉnh giao diện và thông tin hiển thị của quán trên hệ thống.</p>
                </div>
                {stores.length > 1 && (
                    <select
                        value={selectedStoreId}
                        onChange={e => handleSelectStore(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm"
                    >
                        {stores.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
                {/* Cover Banner */}
                <div className="h-64 sm:h-80 w-full relative group cursor-pointer bg-slate-100" onClick={() => !coverUploading && coverInputRef.current?.click()}>
                    <img
                        src={storeForm.coverImage ? (storeForm.coverImage.startsWith('http') ? storeForm.coverImage : `http://localhost:3000${storeForm.coverImage}`) : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop"}
                        alt="Store Cover"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity backdrop-blur-sm ${coverUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {coverUploading ? (
                            <>
                                <Loader2 size={36} className="text-white animate-spin" />
                                <span className="ml-3 text-white font-bold text-lg">Đang tải lên...</span>
                            </>
                        ) : (
                            <>
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
                                    <Camera size={32} className="text-white" />
                                </div>
                                <span className="ml-3 text-white font-bold text-lg">Thay đổi ảnh bìa</span>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={coverInputRef}
                        onChange={handleCoverChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                <div className="px-6 sm:px-10 pb-10 relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-20 mb-8 z-10 relative">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full p-1.5 shadow-2xl shadow-slate-900/10">
                                <div className="w-full h-full rounded-full overflow-hidden relative bg-primary-100 flex items-center justify-center">
                                    <span className="text-5xl font-bold text-primary-500">
                                        {storeForm.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="mb-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-0 opacity-0 pointer-events-none">
                            {/* Placeholder to keep header height if needed, or just remove */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left Column: Location (Wide) */}
                        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin className="text-primary-500" /> Vị trí trên bản đồ
                            </h2>
                            <div className="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Địa chỉ</label>
                                    <div className="relative mb-4">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500/70" size={20} />
                                        <input
                                            type="text"
                                            value={storeForm.address}
                                            onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-medium shadow-sm transition-all"
                                            placeholder="Nhập địa chỉ..."
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Chọn vị trí trên bản đồ</label>
                                        <MapSelector 
                                            lat={Number(storeForm.lat) || 10.4967} 
                                            lng={Number(storeForm.lng) || 105.1167} 
                                            onChange={(lat, lng) => setStoreForm(prev => ({ ...prev, lat, lng }))}
                                            onAddressChange={(address) => setStoreForm(prev => ({ ...prev, address }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={storeForm.lat}
                                            onChange={(e) => setStoreForm(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                                            className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-medium shadow-sm transition-all"
                                            placeholder="Ví dụ: 10.762622"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={storeForm.lng}
                                            onChange={(e) => setStoreForm(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                                            className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-medium shadow-sm transition-all"
                                            placeholder="Ví dụ: 106.660172"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Primary Info (Narrow) */}
                        <div className="space-y-6 order-1 lg:order-2">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Info className="text-primary-500" /> Thông tin cơ bản
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Tên cửa hàng / Quán ăn</label>
                                    <input
                                        type="text"
                                        value={storeForm.name}
                                        onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-bold text-lg transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Mô tả giới thiệu</label>
                                    <textarea
                                        rows={4}
                                        value={storeForm.description}
                                        onChange={(e) => setStoreForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-700 leading-relaxed resize-none transition-all shadow-sm"
                                        placeholder="Mô tả về cửa hàng của bạn..."
                                    ></textarea>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Giờ mở cửa</label>
                                        <input
                                            type="time"
                                            value={storeForm.openTime}
                                            onChange={(e) => setStoreForm(prev => ({ ...prev, openTime: e.target.value }))}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-bold transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Giờ đóng cửa</label>
                                        <input
                                            type="time"
                                            value={storeForm.closeTime}
                                            onChange={(e) => setStoreForm(prev => ({ ...prev, closeTime: e.target.value }))}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 font-bold transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">Ảnh bìa hiện tại</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 text-sm font-medium truncate">
                                            {storeForm.coverImage ? storeForm.coverImage.split('/').pop() : 'Chưa có ảnh — Click vào banner phía trên để tải lên'}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => coverInputRef.current?.click()}
                                            disabled={coverUploading}
                                            className="px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl font-bold text-sm transition-colors whitespace-nowrap disabled:opacity-50"
                                        >
                                            {coverUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5 italic">Click vào ảnh bìa hoặc nút bên cạnh để thay đổi. Ảnh cũ sẽ tự động bị xóa.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Section with Save Button */}
                    <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3 text-slate-500 italic text-sm">
                            <Info size={16} /> Nhấn "Lưu thông tin" để cập nhật các thay đổi của bạn.
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            {saved && (
                                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm animate-in fade-in zoom-in duration-300">
                                    <CheckCircle2 size={18} /> Đã lưu thành công!
                                </span>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/25 hover:-translate-y-0.5 disabled:opacity-60 active:scale-95"
                            >
                                {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                Lưu thông tin
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* === QR CODE CARD === */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                            <QrCode size={20} className="text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Mã QR Quán</h2>
                            <p className="text-sm text-slate-500">Khách hàng quét mã để nghe thuyết minh tự động theo ngôn ngữ của họ.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateQr}
                        disabled={qrGenerating || !storeForm.id}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-primary-500/20 disabled:opacity-60 text-sm"
                    >
                        {qrGenerating
                            ? <Loader2 size={16} className="animate-spin" />
                            : <RefreshCw size={16} />
                        }
                        {qrCodes.length > 0 ? 'Tạo QR mới' : 'Tạo mã QR'}
                    </button>
                </div>

                <div className="p-8">
                    {qrLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-primary-500" size={36} />
                        </div>
                    ) : qrCodes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 gap-4">
                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
                                <QrCode size={40} className="text-slate-300" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-slate-700 text-lg">Chưa có mã QR</h3>
                                <p className="text-slate-400 text-sm mt-1">Nhấn <strong>"Tạo mã QR"</strong> để tạo mã QR cho quán và chia sẻ với khách hàng.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-8 justify-center">
                            {qrCodes.slice(0, 3).map((qr, idx) => (
                                <div key={qr.id} className="flex flex-col items-center gap-4">
                                    <div className={`p-3 rounded-2xl border-2 shadow-md ${qr.isActive ? 'border-primary-200 bg-primary-50/30' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                                        <img
                                            src={qr.qrImageUrl}
                                            alt={`QR Code ${idx + 1}`}
                                            className="w-48 h-48 rounded-xl"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${qr.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                            {qr.isActive ? <CheckCircle2 size={11} /> : null}
                                            {qr.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1.5">
                                            {new Date(qr.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    {qr.isActive && (
                                        <button
                                            onClick={() => handleDownloadQr(qr.qrImageUrl)}
                                            className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-400 hover:bg-primary-50 px-4 py-2 rounded-xl transition-all"
                                        >
                                            <Download size={15} />
                                            Tải về / In ấn
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {qrCodes.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-3 bg-amber-50 rounded-xl p-4">
                            <div className="text-amber-500 text-lg">💡</div>
                            <p className="text-sm text-amber-800">
                                <strong>Hướng dẫn:</strong> In mã QR này và đặt tại quán. Khách hàng quét bằng ứng dụng
                                <strong> Smart Tour</strong> → màn hình giới thiệu quán mở ra → thuyết minh <strong>tự động phát</strong> theo ngôn ngữ của khách.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreInfo;
