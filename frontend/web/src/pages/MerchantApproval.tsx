import React, { useState, useEffect } from 'react';
import { 
    Users, Search, CheckCircle2, XCircle, 
    Clock, Store, Shield, AlertCircle, Loader2
} from 'lucide-react';
import { adminApi } from '../utils/api';
import Modal from '../components/Modal';
import type { Merchant } from '../types';

const MerchantApproval: React.FC = () => {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getMerchants(1, 100);
            setMerchants(res.data || []);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách merchant:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn duyệt merchant này?')) return;
        try {
            await adminApi.approveMerchant(id);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Duyệt thất bại');
        }
    };

    const handleRejectSubmit = async () => {
        if (!selectedMerchant || !rejectReason) return;
        setIsSubmitting(true);
        try {
            await adminApi.rejectMerchant(selectedMerchant.id, rejectReason);
            setIsRejectModalOpen(false);
            setRejectReason('');
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Từ chối thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const pendingMerchants = merchants.filter(m => m.status === 'pending');
    const filteredMerchants = merchants.filter(m => 
        m.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">Đã duyệt</span>;
            case 'pending': return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700">Chờ duyệt</span>;
            case 'rejected': return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700">Đã từ chối</span>;
            default: return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Shield className="text-primary-600" size={32} />
                    Duyệt đối tác Merchant
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Quản lý và phê duyệt các yêu cầu đăng ký kinh doanh trên hệ thống.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Clock size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">Đang chờ duyệt</div>
                        <div className="text-2xl font-bold text-amber-600">{pendingMerchants.length}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><CheckCircle2 size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">Đã kích hoạt</div>
                        <div className="text-2xl font-bold text-emerald-600">{merchants.filter(m => m.status === 'approved').length}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600"><XCircle size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">Đã từ chối</div>
                        <div className="text-2xl font-bold text-rose-600">{merchants.filter(m => m.status === 'rejected').length}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên cơ sở hoặc Chủ sở hữu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary-500" size={40} />
                        </div>
                    )}
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Cơ sở kinh doanh</th>
                                <th className="px-6 py-4">Chủ sở hữu</th>
                                <th className="px-6 py-4">Mã số thuế</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMerchants.map((merchant) => (
                                <tr key={merchant.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                                                <Store size={20} />
                                            </div>
                                            <div className="font-bold text-slate-900">{merchant.businessName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {merchant.user?.name}
                                        <div className="text-xs text-slate-400">{merchant.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{merchant.taxCode || 'N/A'}</td>
                                    <td className="px-6 py-4">{getStatusBadge(merchant.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {merchant.status === 'pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleApprove(merchant.id)}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-500/20"
                                                >
                                                    Chấp nhận
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedMerchant(merchant); setIsRejectModalOpen(true); }}
                                                    className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100"
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => { setSelectedMerchant(merchant); setIsDetailOpen(true); }}
                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <AlertCircle size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && filteredMerchants.length === 0 && (
                        <div className="py-20 text-center text-slate-400 font-medium whitespace-normal px-6">
                            <div className="flex flex-col items-center gap-3">
                                <Users size={40} className="text-slate-200" />
                                Không tìm thấy đối tác nào phù hợp.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Từ chối yêu cầu Merchant"
            >
                <div className="space-y-4">
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <div className="text-sm font-bold text-rose-800 mb-1">Cơ sở: {selectedMerchant?.businessName}</div>
                        <p className="text-xs text-rose-600 font-medium">Bạn nên cung cấp lý do cụ thể để đối tác có thể cập nhật lại thông tin.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Lý do từ chối</label>
                        <textarea
                            rows={4}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do ví dụ: Thông tin mã số thuế không hợp lệ, Cơ sở không nằm trong phạm vi hỗ trợ..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 text-slate-900 transition-all resize-none"
                        ></textarea>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsRejectModalOpen(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleRejectSubmit}
                            disabled={!rejectReason || isSubmitting}
                            className="px-8 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Xác nhận từ chối'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Detail Info Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Chi tiết đối tác Merchant"
                maxWidth="max-w-2xl"
            >
                {selectedMerchant && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary-600">
                                <Store size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedMerchant.businessName}</h3>
                                <div className="mt-1">{getStatusBadge(selectedMerchant.status)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-xs uppercase tracking-widest text-slate-400">Thông tin cơ sở</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Mã số thuế</div>
                                        <div className="text-sm font-bold text-slate-900 font-mono tracking-wider">{selectedMerchant.taxCode || 'CHƯA CẬP NHẬT'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Ngày đăng ký</div>
                                        <div className="text-sm font-bold text-slate-900">{new Date(selectedMerchant.createdAt).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Số lượng cửa hàng</div>
                                        <div className="text-sm font-bold text-slate-900">{selectedMerchant.stores?.length || 0} địa điểm</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-xs uppercase tracking-widest text-slate-400">Đại diện pháp luật</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Họ và tên</div>
                                        <div className="text-sm font-bold text-slate-900">{selectedMerchant.user?.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Email liên hệ</div>
                                        <div className="text-sm font-bold text-primary-600 italic underline uppercase text-[10px]">{selectedMerchant.user?.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Số điện thoại</div>
                                        <div className="text-sm font-bold text-slate-900">{selectedMerchant.user?.phone || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedMerchant.status === 'rejected' && selectedMerchant.rejectReason && (
                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                                <div className="text-xs font-bold text-rose-800 uppercase mb-1">Lý do từ chối trước đó:</div>
                                <div className="text-sm text-rose-700 italic">"{selectedMerchant.rejectReason}"</div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                            <button 
                                onClick={() => setIsDetailOpen(false)}
                                className="w-full py-2.5 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MerchantApproval;
