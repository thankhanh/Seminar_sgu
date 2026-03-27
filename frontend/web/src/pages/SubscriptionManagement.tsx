import React, { useState, useEffect } from 'react';
import {
    CreditCard, Check, Zap, Shield, Crown,
    Calendar, AlertCircle, Loader2, ArrowRight,
    Smartphone, Globe
} from 'lucide-react';
import { subscriptionsApi, paymentsApi } from '../utils/api';

const SubscriptionManagement: React.FC = () => {
    const [currentSub, setCurrentSub] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');
    const [newPlanPrice, setNewPlanPrice] = useState('');
    const [newPlanDescription, setNewPlanDescription] = useState('');
    const [newPlanBenefits, setNewPlanBenefits] = useState('');

    const [plans, setPlans] = useState([
        {
            id: 'starter',
            type: 'merchant_starter',
            name: 'Miễn phí (Starter)',
            price: '0đ',
            rawPrice: 0,
            description: 'Mặc định cho mọi cửa hàng.',
            features: [
                'Tối đa 1 địa điểm (POI)',
                'Thuyết minh đa ngôn ngữ',
                'Quản lý thực đơn cơ bản'
            ],
            icon: <Zap className="text-slate-400" size={24} />,
            color: 'bg-slate-50',
            borderColor: 'border-slate-200'
        },
        {
            id: 'business',
            type: 'merchant_business',
            name: 'Nâng cấp 1 (Business)',
            price: '499,000đ / tháng',
            rawPrice: 499000,
            description: 'Dành cho chuỗi cửa hàng nhỏ.',
            features: [
                'Tối đa 5 địa điểm (POI)',
                'Ưu tiên hiển thị trên bản đồ',
                'Phân tích lượt nghe chi tiết'
            ],
            icon: <Shield className="text-primary-500" size={24} />,
            color: 'bg-primary-50',
            borderColor: 'border-primary-200'
        },
        {
            id: 'premium',
            type: 'merchant_premium',
            name: 'Nâng cấp 2 (Premium)',
            price: '999,000đ / tháng',
            rawPrice: 999000,
            description: 'Giải pháp toàn diện cho doanh nghiệp.',
            features: [
                'Tối đa 10 địa điểm (POI)',
                'API tích hợp riêng',
                'Tư vấn nội dung thuyết minh'
            ],
            icon: <Crown className="text-indigo-500" size={24} />,
            color: 'bg-indigo-50',
            borderColor: 'border-indigo-200'
        }
    ]);

    useEffect(() => {
        fetchSubscription();
    }, []);

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
            const res = await subscriptionsApi.create({ plan: planId });
            if (res.requiresPayment) {
                // Should not happen for starter
            } else {
                alert('Kích hoạt gói thành công!');
                fetchSubscription();
            }
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

    const resetNewPlanFields = () => {
        setNewPlanName('');
        setNewPlanPrice('');
        setNewPlanDescription('');
        setNewPlanBenefits('');
    };

    const handleAddPlan = () => {
        if (!newPlanName.trim()) {
            alert('Vui lòng nhập tên gói');
            return;
        }

        const newBenefitsList = newPlanBenefits
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);

        const rawPrice = Number(newPlanPrice.toString().replace(/[^0-9]/g, '')) || 0;
        const formattedPrice = rawPrice > 0 ? `${rawPrice.toLocaleString('vi-VN')}đ` : '0đ';

        const newPlan = {
            id: `custom_${Date.now()}`,
            type: `merchant_custom_${Date.now()}`,
            name: newPlanName.trim(),
            price: formattedPrice,
            rawPrice,
            description: newPlanDescription.trim(),
            features: newBenefitsList.length ? newBenefitsList : ['Không có quyền lợi cụ thể'],
            icon: <Shield className="text-primary-500" size={24} />,
            color: 'bg-emerald-50',
            borderColor: 'border-emerald-200'
        };

        setPlans((prevPlans) => [...prevPlans, newPlan]);
        setShowAddPlanModal(false);
        resetNewPlanFields();
        alert('Tạo gói mới thành công');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-500" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <CreditCard className="text-primary-600" size={32} />
                        Gói dịch vụ Merchant
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Nâng cấp tài khoản để quản lý nhiều địa điểm hơn.</p>
                </div>
                <button
                    onClick={() => setShowAddPlanModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition"
                >
                    Thêm
                </button>
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
                                <span className="flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-bold border border-emerald-400/30">
                                    <Check size={16} /> Đang hoạt động
                                </span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full md:w-auto text-center">
                            <div className="text-sm font-medium text-primary-100 mb-1">Giới hạn POI</div>
                            <div className="text-3xl font-bold">{currentSub.maxStore} <span className="text-lg font-normal opacity-70">Cửa hàng</span></div>
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
                            disabled={isSubmitting || currentSub?.plan === plan.id}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${currentSub?.plan === plan.id
                                ? 'bg-emerald-50 text-emerald-600 cursor-default'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                                }`}
                        >
                            {currentSub?.plan === plan.id ? (
                                <>Đang sử dụng <Check size={18} /></>
                            ) : (
                                <>Chọn ngay <ArrowRight size={18} /></>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Plan Modal */}
            {showAddPlanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Thêm gói mới</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Tên gói</label>
                                <input
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Phí</label>
                                <input
                                    value={newPlanPrice}
                                    onChange={(e) => setNewPlanPrice(e.target.value)}
                                    placeholder="Nhập số (VD: 499000)"
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Mô tả</label>
                                <textarea
                                    value={newPlanDescription}
                                    onChange={(e) => setNewPlanDescription(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Quyền lợi (mỗi dòng 1 quyền lợi)</label>
                                <textarea
                                    value={newPlanBenefits}
                                    onChange={(e) => setNewPlanBenefits(e.target.value)}
                                    placeholder="Tối đa 2 địa điểm (POI)\nThuyết minh đa ngôn ngữ\nQuản lý thực đơn nâng cao"
                                    className="w-full mt-1 h-24 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <button
                                    onClick={() => {
                                        setShowAddPlanModal(false);
                                        resetNewPlanFields();
                                    }}
                                    className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddPlan}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                                >
                                    Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
