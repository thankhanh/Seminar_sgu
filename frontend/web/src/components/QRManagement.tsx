import React, { useState, useEffect } from 'react';
import { QrCode, Plus, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { qrApi } from '../utils/api';

interface QrCodeItem {
    id: string;
    code: string;
    qrImageUrl: string;
    isActive: boolean;
    createdAt: string;
}

interface Props {
    storeId: string;
    storeName?: string;
}

const QRManagement: React.FC<Props> = ({ storeId, storeName }) => {
    const [qrCodes, setQrCodes] = useState<QrCodeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchQrCodes = async () => {
        setLoading(true);
        try {
            const data = await qrApi.getByStore(storeId);
            setQrCodes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Lỗi khi tải QR codes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storeId) fetchQrCodes();
    }, [storeId]);

    const handleCreate = async () => {
        setCreating(true);
        try {
            await qrApi.create(storeId);
            fetchQrCodes();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi tạo QR code');
        } finally {
            setCreating(false);
        }
    };

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <QrCode size={18} className="text-primary-500" />
                    Mã QR {storeName ? `— ${storeName}` : ''}
                </h3>
                <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Tạo QR mới
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                </div>
            ) : qrCodes.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <QrCode size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm">Chưa có mã QR nào.</p>
                    <p className="text-slate-400 text-xs mt-1">Nhấn "Tạo QR mới" để tạo mã cho quán.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {qrCodes.map(qr => (
                        <div key={qr.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            {/* QR Image */}
                            <div className="flex-shrink-0">
                                {qr.qrImageUrl ? (
                                    <img 
                                        src={qr.qrImageUrl} 
                                        alt={`QR ${qr.code}`} 
                                        className="w-20 h-20 rounded-lg border border-slate-200"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <QrCode size={32} className="text-slate-400" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-mono text-sm font-semibold text-slate-900 truncate">
                                        {qr.code}
                                    </p>
                                    <button
                                        onClick={() => handleCopyCode(qr.code, qr.id)}
                                        className="flex-shrink-0 p-1 text-slate-400 hover:text-primary-600 rounded transition-colors"
                                        title="Sao chép mã"
                                    >
                                        {copiedId === qr.id ? (
                                            <Check size={14} className="text-emerald-500" />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Tạo lúc: {new Date(qr.createdAt).toLocaleDateString('vi-VN', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        qr.isActive 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {qr.isActive ? 'Hoạt động' : 'Vô hiệu'}
                                    </span>
                                    {qr.qrImageUrl && (
                                        <a
                                            href={qr.qrImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-700 font-semibold"
                                        >
                                            <ExternalLink size={10} /> Xem ảnh QR
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QRManagement;
