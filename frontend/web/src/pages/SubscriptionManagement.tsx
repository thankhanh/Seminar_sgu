import React, { useState, useEffect } from 'react';
import {
    CreditCard, Check, Zap, Shield, Crown,
    Calendar, AlertCircle, Loader2, ArrowRight,
    Smartphone, Globe
} from 'lucide-react';
import { subscriptionsApi, paymentsApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const SubscriptionManagement: React.FC = () => {
    const { user } = useAuth();
    const [currentSub, setCurrentSub] = useState<any>(null);
    const [allSubs, setAllSubs] = useState<any[]>([]);
    const [totalSubs, setTotalSubs] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    
    // Admin editing state
    const [editingSub, setEditingSub] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        plan: '',
        maxStore: 1,
        status: 'active',
        endDate: ''
    });

    const plans = [
        {
            id: 'starter',
            type: 'merchant_starter',
            name: 'Gói Khởi Tạo (Starter)',
            price: '0đ / tháng',
            rawPrice: 0,
            description: 'Giải pháp cơ bản để bạn làm quen với Smart Tour.',
            features: [
                'Quản lý tối đa 1 địa điểm (POI)',
                'Thuyết minh 2 ngôn ngữ (Việt - Anh)',
                'Quản lý thực đơn & thông tin cơ bản',
                'Hỗ trợ qua email'
            ],
            icon: <Zap className="text-slate-400" size={24} />,
            color: 'bg-slate-50',
            borderColor: 'border-slate-200'
        },
        {
            id: 'business',
            type: 'merchant_business',
            name: 'Gói Kinh Doanh (Business)',
            price: '499,000đ / tháng',
            rawPrice: 499000,
            description: 'Tối ưu cho chuỗi cửa hàng và doanh nghiệp nhỏ.',
            features: [
                'Quản lý lên đến 5 địa điểm (POI)',
                'Hỗ trợ mọi ngôn ngữ thuyết minh',
                'Ưu tiên hiển thị trên bản đồ App',
                'Thống kê lượt nghe & tương tác'
            ],
            icon: <Shield className="text-primary-500" size={24} />,
            color: 'bg-primary-50',
            borderColor: 'border-primary-200'
        },
        {
            id: 'premium',
            type: 'merchant_premium',
            name: 'Gói Chuyên Nghiệp (Premium)',
            price: '999,000đ / tháng',
            rawPrice: 999000,
            description: 'Giải pháp cao cấp nhất cho doanh nghiệp lớn.',
            features: [
                'Quản lý lên đến 10 địa điểm (POI)',
                'Hỗ trợ mọi ngôn ngữ & AI Storytelling',
                'Tư vấn nội dung thuyết minh riêng',
                'Hỗ trợ kỹ thuật ưu tiên 24/7'
            ],
            icon: <Crown className="text-indigo-500" size={24} />,
            color: 'bg-indigo-50',
            borderColor: 'border-indigo-200'
        }
    ];

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchAllSubscriptions(page);
        } else if (user?.role === 'merchant') {
            fetchSubscription();
        }
    }, [user, page]);

    const fetchSubscription = async () => {
        setLoading(true);
        try {
            const data = await subscriptionsApi.getMy();
            setCurrentSub(data);
        } catch (err) {
            console.error('Lỗi khi lấy thông tin gói:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSubscriptions = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await subscriptionsApi.getAll(pageNum, 10);
            setAllSubs(res.data || []);
            setTotalSubs(res.total || 0);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách gói:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSub = async () => {
        if (!editingSub) return;
        setIsSubmitting(true);
        try {
            await subscriptionsApi.update(editingSub.id, editForm);
            alert('Cập nhật gói thành công!');
            setEditingSub(null);
            fetchAllSubscriptions(page);
        } catch (err: any) {
            alert(err.message || 'Lỗi khi cập nhật gói');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (sub: any) => {
        setEditingSub(sub);
        setEditForm({
            plan: sub.plan,
            maxStore: sub.maxStore,
            status: sub.status,
            endDate: new Date(sub.endDate).toISOString().split('T')[0]
        });
    };

    const handlePlanClick = (plan: any) => {
        if (plan.id === 'starter') {
            handleSubscribe(plan.id);
        } else {
            setSelectedPlan(plan);
            setShowPaymentModal(true);
        }
    };

    const handleSubscribe = async (planId: string) => {
        setIsSubmitting(true);
        try {
            await subscriptionsApi.create({ plan: planId });
            alert('Kích hoạt gói thành công!');
            fetchSubscription();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi kích hoạt gói');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePayment = async (method: 'momo' | 'vnpay') => {
        if (!selectedPlan) return;
        setIsSubmitting(true);
        try {
            const res = await paymentsApi.create({
                method,
                type: selectedPlan.type
            });
            if (res.paymentUrl) {
                window.location.href = res.paymentUrl;
            }
        } catch (err: any) {
            alert(err.message || 'Lỗi khởi tạo thanh toán');
            setIsSubmitting(false);
        }
    };

    if (loading && !allSubs.length && !currentSub) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-500" size={40} />
            </div>
        );
    }

    if (user?.role === 'admin') {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Shield className="text-primary-600" size={32} />
                            Quản lý Gói Merchant
                        </h1>
                        <p className="text-slate-500 mt-1">Theo dõi và chỉnh sửa quyền hạn gói của các Merchant.</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700">Merchant / Doanh nghiệp</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700">Gói hiện tại</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 text-center">Giới hạn POI</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700">Ngày hết hạn</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700">Trạng thái</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allSubs.map((sub: any) => (
                                    <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{sub.merchant?.businessName}</div>
                                            <div className="text-xs text-slate-500">{sub.merchant?.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                sub.plan === 'starter' ? 'bg-slate-100 text-slate-600' :
                                                sub.plan === 'business' ? 'bg-primary-100 text-primary-600' :
                                                'bg-indigo-100 text-indigo-600'
                                            }`}>
                                                {sub.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">
                                            {sub.maxStore}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(sub.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openEditModal(sub)}
                                                className="text-primary-600 font-bold text-sm hover:underline"
                                            >
                                                Chỉnh sửa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {allSubs.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-slate-500">Chưa có dữ liệu đăng ký nào.</p>
                        </div>
                    )}
                </div>

                <Pagination 
                    currentPage={page} 
                    totalItems={totalSubs} 
                    itemsPerPage={10} 
                    onPageChange={setPage} 
                />

                {/* Edit Modal */}
                <Modal 
                    isOpen={!!editingSub} 
                    onClose={() => setEditingSub(null)}
                    title="Chỉnh sửa quyền hạn gói"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Gói dịch vụ</label>
                            <select 
                                value={editForm.plan} 
                                onChange={e => setEditForm({...editForm, plan: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20"
                            >
                                <option value="starter">Starter</option>
                                <option value="business">Business</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Giới hạn POI (Số lượng cửa hàng)</label>
                            <input 
                                type="number" 
                                value={editForm.maxStore} 
                                onChange={e => setEditForm({...editForm, maxStore: parseInt(e.target.value)})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Ngày hết hạn</label>
                            <input 
                                type="date" 
                                value={editForm.endDate} 
                                onChange={e => setEditForm({...editForm, endDate: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Trạng thái</label>
                            <select 
                                value={editForm.status} 
                                onChange={e => setEditForm({...editForm, status: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20"
                            >
                                <option value="active">Đang hoạt động</option>
                                <option value="expired">Đã hết hạn</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setEditingSub(null)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Hủy</button>
                            <button 
                                onClick={handleUpdateSub}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-all flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <CreditCard className="text-primary-600" size={32} />
                    Gói dịch vụ Merchant
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Nâng cấp tài khoản để quản lý nhiều địa điểm hơn.</p>
            </div>

            {currentSub ? (
                <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary-100 font-bold uppercase text-xs tracking-widest">
                                <Zap size={14} /> Gói hiện tại của bạn
                            </div>
                            <h2 className="text-4xl font-black capitalize">{currentSub.plan}</h2>
                            <div className="flex items-center gap-4 text-primary-50 mt-4">
                                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm font-medium">
                                    <Calendar size={16} /> Hết hạn: {new Date(currentSub.endDate).toLocaleDateString()}
                                </span>
                                <span className={`flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-bold border border-emerald-400/30 ${currentSub.status !== 'active' ? 'bg-rose-400/20 text-rose-300 border-rose-400/30' : ''}`}>
                                    {currentSub.status === 'active' ? <Check size={16} /> : <AlertCircle size={16} />}
                                    {currentSub.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng/Hết hạn'}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full md:w-auto text-center relative">
                            <div className="text-sm font-medium text-primary-100 mb-1">Quyền hạn POI hiện tại</div>
                            <div className="text-3xl font-bold">
                                {currentSub.status === 'active' ? currentSub.maxStore : 1} 
                                <span className="text-lg font-normal opacity-70 ml-1">Cửa hàng</span>
                            </div>
                            {currentSub.status !== 'active' && (
                                <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black animate-pulse">
                                    GIỚI HẠN
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 text-amber-800">
                    <AlertCircle className="shrink-0" size={24} />
                    <div className="flex-1">
                        <p className="font-bold">Bạn đang sử dụng gói mặc định hoặc chưa có gói.</p>
                        <p className="text-sm opacity-80">Gói Starter cho phép bạn quản lý 1 cửa hàng miễn phí.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-white rounded-3xl border-2 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${currentSub?.plan === plan.id ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-100'
                            }`}
                    >
                        <div className={`w-14 h-14 ${plan.color} rounded-2xl flex items-center justify-center mb-6`}>
                            {plan.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{plan.description}</p>

                        <div className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                    <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePlanClick(plan)}
                            disabled={isSubmitting || (currentSub?.plan === plan.id && currentSub?.status === 'active')}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${currentSub?.plan === plan.id && currentSub?.status === 'active'
                                ? 'bg-emerald-50 text-emerald-600 cursor-default'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                                }`}
                        >
                            {currentSub?.plan === plan.id && currentSub?.status === 'active' ? (
                                <>Đang sử dụng <Check size={18} /></>
                            ) : (
                                <>Chọn ngay <ArrowRight size={18} /></>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Chọn phương thức thanh toán</h2>
                        <p className="text-slate-500 text-center mb-8">Thanh toán cho gói <span className="font-bold text-primary-600">{selectedPlan.name}</span></p>

                        <div className="space-y-4">
                            <button
                                onClick={() => handlePayment('momo')}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-pink-500 hover:bg-pink-50 transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
                                    <Smartphone size={24} />
                                </div>
                                <div className="text-left font-bold text-slate-900">Thanh toán qua Ví MoMo</div>
                            </button>

                            <button
                                onClick={() => handlePayment('vnpay')}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <Globe size={24} />
                                </div>
                                <div className="text-left font-bold text-slate-900">Thanh toán qua VNPay</div>
                            </button>
                        </div>

                        <button
                            disabled={isSubmitting}
                            onClick={() => setShowPaymentModal(false)}
                            className="w-full mt-8 py-3 text-slate-500 font-medium hover:text-slate-800 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
