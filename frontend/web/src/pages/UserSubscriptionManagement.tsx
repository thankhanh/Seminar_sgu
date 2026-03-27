import React, { useState, useEffect } from 'react';
import {
    CreditCard, Check, Zap, Shield, Crown,
    Calendar, AlertCircle, Loader2
} from 'lucide-react';
import { subscriptionsApi } from '../utils/api';

const UserSubscriptionManagement: React.FC = () => {
    const [currentSub, setCurrentSub] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');
    const [newPlanPrice, setNewPlanPrice] = useState('');
    const [newPlanDescription, setNewPlanDescription] = useState('');
    const [newPlanBenefits, setNewPlanBenefits] = useState('');

    const [showEditPlanModal, setShowEditPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [editPlanName, setEditPlanName] = useState('');
    const [editPlanPrice, setEditPlanPrice] = useState('');
    const [editPlanDescription, setEditPlanDescription] = useState('');
    const [editPlanBenefits, setEditPlanBenefits] = useState('');

    const [plans, setPlans] = useState([
        {
            id: 'user_basic',
            type: 'user_basic',
            name: 'Gói Cơ Bản',
            price: '50,000đ / tháng',
            rawPrice: 50000,
            description: 'Gói cơ bản cho người dùng cá nhân.',
            features: [
                'Truy cập cơ bản',
                'Hỗ trợ email',
                'Lưu trữ 1GB'
            ],
            icon: <Zap className="text-slate-400" size={24} />,
            color: 'bg-slate-50',
            borderColor: 'border-slate-200'
        },
        {
            id: 'user_premium',
            type: 'user_premium',
            name: 'Gói Premium',
            price: '150,000đ / tháng',
            rawPrice: 150000,
            description: 'Gói nâng cao cho người dùng chuyên nghiệp.',
            features: [
                'Truy cập đầy đủ',
                'Hỗ trợ ưu tiên',
                'Lưu trữ 10GB',
                'API riêng'
            ],
            icon: <Shield className="text-primary-500" size={24} />,
            color: 'bg-primary-50',
            borderColor: 'border-primary-200'
        },
        {
            id: 'user_enterprise',
            type: 'user_enterprise',
            name: 'Gói Enterprise',
            price: '500,000đ / tháng',
            rawPrice: 500000,
            description: 'Giải pháp toàn diện cho doanh nghiệp.',
            features: [
                'Tất cả tính năng',
                'Hỗ trợ 24/7',
                'Lưu trữ không giới hạn',
                'Tích hợp tùy chỉnh',
                'Báo cáo chi tiết'
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
            type: `user_custom_${Date.now()}`,
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

    const handleEditPlan = (plan: any) => {
        setEditingPlan(plan);
        setEditPlanName(plan.name);
        setEditPlanPrice(plan.rawPrice.toString());
        setEditPlanDescription(plan.description);
        setEditPlanBenefits(plan.features.join('\n'));
        setShowEditPlanModal(true);
    };

    const handleUpdatePlan = () => {
        if (!editPlanName.trim() || !editingPlan) {
            alert('Vui lòng nhập tên gói');
            return;
        }

        const updatedBenefitsList = editPlanBenefits
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);

        const rawPrice = Number(editPlanPrice.toString().replace(/[^0-9]/g, '')) || 0;
        const formattedPrice = rawPrice > 0 ? `${rawPrice.toLocaleString('vi-VN')}đ` : '0đ';

        setPlans((prevPlans) =>
            prevPlans.map((plan) =>
                plan.id === editingPlan.id
                    ? {
                        ...plan,
                        name: editPlanName.trim(),
                        price: formattedPrice,
                        rawPrice,
                        description: editPlanDescription.trim(),
                        features: updatedBenefitsList.length ? updatedBenefitsList : ['Không có quyền lợi cụ thể']
                    }
                    : plan
            )
        );

        setShowEditPlanModal(false);
        setEditingPlan(null);
        resetEditFields();
        alert('Cập nhật gói thành công');
    };

    const handleDeletePlan = (plan: any) => {
        console.log('handleDeletePlan called with plan:', plan);
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa gói "${plan.name}"?`);
        console.log('User confirmed:', confirmDelete);
        if (confirmDelete) {
            setPlans((prevPlans) => prevPlans.filter((p) => p.id !== plan.id));
            alert('Xóa gói thành công');
        }
    };

    const resetEditFields = () => {
        setEditPlanName('');
        setEditPlanPrice('');
        setEditPlanDescription('');
        setEditPlanBenefits('');
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
                        Quản lý gói người dùng
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
                        <p className="text-sm opacity-80">Gói Cơ Bản cho phép bạn quản lý 1 cửa hàng miễn phí.</p>
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

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleEditPlan(plan)}
                                className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
                            >
                                Cập nhật
                            </button>
                            <button
                                onClick={() => handleDeletePlan(plan)}
                                className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
                            >
                                Xoá
                            </button>
                        </div>
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
                                    placeholder="Truy cập cơ bản\nHỗ trợ email\nLưu trữ 1GB"
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

            {/* Edit Plan Modal */}
            {showEditPlanModal && editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Chỉnh sửa gói</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Tên gói</label>
                                <input
                                    value={editPlanName}
                                    onChange={(e) => setEditPlanName(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Phí</label>
                                <input
                                    value={editPlanPrice}
                                    onChange={(e) => setEditPlanPrice(e.target.value)}
                                    placeholder="Nhập số (VD: 499000)"
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Mô tả</label>
                                <textarea
                                    value={editPlanDescription}
                                    onChange={(e) => setEditPlanDescription(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Quyền lợi (mỗi dòng 1 quyền lợi)</label>
                                <textarea
                                    value={editPlanBenefits}
                                    onChange={(e) => setEditPlanBenefits(e.target.value)}
                                    placeholder="Truy cập cơ bản\nHỗ trợ email\nLưu trữ 1GB"
                                    className="w-full mt-1 h-24 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <button
                                    onClick={() => {
                                        setShowEditPlanModal(false);
                                        setEditingPlan(null);
                                        resetEditFields();
                                    }}
                                    className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleUpdatePlan}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSubscriptionManagement;
