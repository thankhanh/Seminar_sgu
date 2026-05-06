import React, { useState, useEffect } from 'react';
import {
    CreditCard, Check, Zap, Shield, Crown,
    Calendar, AlertCircle, Loader2, ArrowRight,
    Smartphone, Edit2, Users, Store, Plus,
    X, Save, Mail
} from 'lucide-react';
import { subscriptionsApi, paymentsApi, planMetadataApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionManagement: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [currentSub, setCurrentSub] = useState<any>(null);
    const [allPlans, setAllPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Merchant specific
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    // Admin specific
    const [activeTab, setActiveTab] = useState<'merchant' | 'user'>('merchant');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [grantForm, setGrantForm] = useState({ email: '', planKey: '' });
    const [merchantSubs, setMerchantSubs] = useState<any[]>([]);
    const [userSubs, setUserSubs] = useState<any[]>([]);
    const [showEditSubModal, setShowEditSubModal] = useState(false);
    const [editingSub, setEditingSub] = useState<any>(null);
    const [editSubPlan, setEditSubPlan] = useState('');

    useEffect(() => {
        initData();
    }, []);

    const initData = async () => {
        setLoading(true);
        try {
            const [plansData, subData, mSubsData, uSubsData] = await Promise.all([
                planMetadataApi.getAll(),
                !isAdmin ? subscriptionsApi.getMy() : Promise.resolve(null),
                isAdmin ? subscriptionsApi.getAll(1, 100).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                isAdmin ? subscriptionsApi.getAllUser(1, 100).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
            ]);
            setAllPlans(plansData);
            if (!isAdmin) setCurrentSub(subData);
            if (isAdmin) {
                setMerchantSubs(mSubsData?.data || []);
                setUserSubs(uSubsData?.data || []);
            }
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlanClick = (plan: any) => {
        // If it's the free plan, subscribe directly
        if (Number(plan.price) === 0) {
            handleSubscribe(plan.planKey);
        } else {
            setSelectedPlan(plan);
            setShowPaymentModal(true);
        }
    };

    const handleSubscribe = async (planKey: string) => {
        setIsSubmitting(true);
        try {
            const plan = planKey.replace('merchant_', '').replace('customer_', '').toLowerCase();
            const res = await subscriptionsApi.create({ plan });
            if (!res.requiresPayment) {
                alert('Kích hoạt gói thành công!');
                initData();
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
                type: selectedPlan.planKey
            });
            if (res.paymentUrl) {
                window.location.href = res.paymentUrl;
            }
        } catch (err: any) {
            alert(err.message || 'Lỗi khởi tạo thanh toán');
            setIsSubmitting(false);
        }
    };

    const handleEditPlan = (plan: any) => {
        setEditingPlan({ ...plan });
        setShowEditModal(true);
    };

    const handleSavePlan = async () => {
        if (!editingPlan) return;
        setIsSubmitting(true);
        try {
            await planMetadataApi.update(editingPlan.planKey, {
                price: Number(editingPlan.price),
                maxStore: Number(editingPlan.maxStore),
                maxPOI: Number(editingPlan.maxPOI),
                description: editingPlan.description,
                name: editingPlan.name
            });
            setShowEditModal(false);
            initData();
            alert('Cập nhật gói thành công!');
        } catch (err: any) {
            alert(err.message || 'Lỗi cập nhật');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGrantPlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!grantForm.email || !grantForm.planKey) return;

        setIsSubmitting(true);
        try {
            if (activeTab === 'merchant') {
                const plan = grantForm.planKey.replace('merchant_', '').toLowerCase();
                await subscriptionsApi.grantMerchantPlan({ email: grantForm.email, plan });
            } else {
                const plan = grantForm.planKey.replace('customer_', '').toLowerCase();
                await subscriptionsApi.grantUserPlan({ email: grantForm.email, plan });
            }
            alert('Cấp gói thành công!');
            setGrantForm({ email: '', planKey: '' });
        } catch (err: any) {
            alert(err.message || 'Lỗi khi cấp gói');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSub = (sub: any) => {
        setEditingSub(sub);
        setEditSubPlan(sub.plan);
        setShowEditSubModal(true);
    };

    const handleSaveSub = async () => {
        if (!editingSub || !editSubPlan) return;
        setIsSubmitting(true);
        try {
            if (activeTab === 'merchant') {
                await subscriptionsApi.updateMerchantSub(editingSub.id, editSubPlan);
            } else {
                await subscriptionsApi.updateUserSub(editingSub.id, editSubPlan);
            }
            setShowEditSubModal(false);
            setEditingSub(null);
            initData();
            alert('Cập nhật gói thành công!');
        } catch (err: any) {
            alert(err.message || 'Lỗi cập nhật gói');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-500" size={40} />
            </div>
        );
    }

    const merchantPlans = allPlans.filter(p => p.planKey.startsWith('merchant_')).sort((a, b) => Number(a.price) - Number(b.price));
    const userPlans = allPlans.filter(p => p.planKey.startsWith('customer_')).sort((a, b) => Number(a.price) - Number(b.price));

    const defaultMerchantPlan = merchantPlans.find(p => Number(p.price) === 0);

    // ─────────────────────────────────────────────────────────────
    // ADMIN VIEW
    // ─────────────────────────────────────────────────────────────
    if (isAdmin) {
        const filteredPlans = activeTab === 'merchant' ? merchantPlans : userPlans;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Shield className="text-indigo-600" size={32} />
                            Quản lý Gói dịch vụ
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Cấu hình các gói và cấp quyền cho người dùng.</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setActiveTab('merchant')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'merchant' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Store size={18} /> Chủ quán
                        </button>
                        <button
                            onClick={() => setActiveTab('user')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'user' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Users size={18} /> Người dùng
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List Plans */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                                    Danh sách {activeTab === 'merchant' ? 'Gói Chủ quán' : 'Gói Người dùng'}
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {filteredPlans.map(plan => (
                                    <div key={plan.planKey} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 text-lg">{plan.name}</h4>
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded border border-slate-200">
                                                    {plan.planKey.replace('merchant_', '').replace('customer_', '')}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm italic">{plan.description}</p>
                                            <div className="flex flex-wrap gap-4 mt-2">
                                                <div className="text-emerald-600 font-bold text-sm">
                                                    {plan.price == 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
                                                </div>
                                                {activeTab === 'merchant' && (
                                                    <div className="text-slate-400 text-sm flex items-center gap-1">
                                                        <Store size={14} /> Tối đa {plan.maxPOI} POIs
                                                    </div>
                                                )}
                                                {activeTab === 'user' && (
                                                    <div className="text-slate-400 text-sm flex items-center gap-1">
                                                        🎧 {plan.maxPOI === 0 ? 'Không giới hạn' : `${plan.maxPOI} bài/ngày`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEditPlan(plan)}
                                            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Grant Plan Form */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Plus size={24} className="text-primary-400" /> Cấp gói dịch vụ
                            </h3>
                            <form onSubmit={handleGrantPlan} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Email người nhận</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={grantForm.email}
                                            onChange={e => setGrantForm({ ...grantForm, email: e.target.value })}
                                            placeholder="merchant@example.com"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Chọn gói cấp</label>
                                    <select
                                        required
                                        value={grantForm.planKey}
                                        onChange={e => setGrantForm({ ...grantForm, planKey: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm appearance-none"
                                    >
                                        <option value="">-- Chọn gói --</option>
                                        {filteredPlans.map(p => (
                                            <option key={p.planKey} value={p.planKey}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-primary-900/40 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                                    CẤP GÓI NGAY
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Subscriptions List */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mt-8">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                            Danh sách {activeTab === 'merchant' ? 'Chủ quán' : 'Người dùng'} đã đăng ký
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 text-sm text-slate-500 font-bold bg-slate-50">
                                    <th className="px-6 py-4">Tài khoản</th>
                                    <th className="px-6 py-4">Gói dịch vụ</th>
                                    <th className="px-6 py-4">Ngày bắt đầu</th>
                                    <th className="px-6 py-4">Ngày hết hạn</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(activeTab === 'merchant' ? merchantSubs : userSubs).map((sub: any) => (
                                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                            {activeTab === 'merchant' ? (
                                                <div>
                                                    <div>{sub.merchant?.businessName || 'Không xác định'}</div>
                                                    <div className="text-slate-500 font-normal">{sub.merchant?.user?.email}</div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div>{sub.user?.name || 'Không xác định'}</div>
                                                    <div className="text-slate-500 font-normal">{sub.user?.email}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold uppercase text-indigo-600">{sub.plan}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(sub.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(sub.endDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {sub.status === 'active' ? 'Hoạt động' : 'Đã hủy/Hết hạn'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleEditSub(sub)}
                                                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                                                title="Sửa gói"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(activeTab === 'merchant' ? merchantSubs : userSubs).length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">Chưa có ai đăng ký gói này.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {showEditModal && editingPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
                            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Chỉnh sửa {editingPlan.name}</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên hiển thị</label>
                                    <input
                                        type="text"
                                        value={editingPlan.name}
                                        onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Giá (VND)</label>
                                    <input
                                        type="number"
                                        value={editingPlan.price}
                                        onChange={e => setEditingPlan({ ...editingPlan, price: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                                {activeTab === 'merchant' && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Số lượng POI tối đa</label>
                                            <input
                                                type="number"
                                                value={editingPlan.maxPOI}
                                                onChange={e => setEditingPlan({ ...editingPlan, maxPOI: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'user' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Số bài nghe / ngày</label>
                                        <p className="text-xs text-slate-400 mb-2">Đặt 0 = không giới hạn</p>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editingPlan.maxPOI}
                                            onChange={e => setEditingPlan({ ...editingPlan, maxPOI: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả ngắn</label>
                                    <textarea
                                        rows={3}
                                        value={editingPlan.description}
                                        onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSavePlan}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Subscription Modal */}
                {showEditSubModal && editingSub && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
                            <button onClick={() => setShowEditSubModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sửa gói {activeTab === 'merchant' ? 'chủ quán' : 'người dùng'}</h2>
                            <p className="text-slate-500 mb-6">
                                Tài khoản: <span className="font-bold text-slate-700">{activeTab === 'merchant' ? (editingSub.merchant?.businessName || 'Không xác định') : (editingSub.user?.name || 'Không xác định')}</span> ({activeTab === 'merchant' ? editingSub.merchant?.user?.email : editingSub.user?.email})
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Gói hiện tại</label>
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase">
                                        {editingSub.plan}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Đổi sang gói</label>
                                    <select
                                        value={editSubPlan}
                                        onChange={e => setEditSubPlan(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium appearance-none"
                                    >
                                        {activeTab === 'merchant' ? (
                                            <>
                                                <option value="starter">Starter (Miễn phí)</option>
                                                <option value="business">Business</option>
                                                <option value="premium">Premium</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="free">Free (Miễn phí)</option>
                                                <option value="monthly">Monthly (Hàng tháng)</option>
                                                <option value="yearly">Yearly (Hàng năm)</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowEditSubModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSaveSub}
                                    disabled={isSubmitting || editSubPlan === editingSub.plan}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // MERCHANT VIEW
    // ─────────────────────────────────────────────────────────────
    const getPlanIcon = (key: string) => {
        if (key.includes('starter') || key.includes('free')) return <Zap className="text-slate-400" size={24} />;
        if (key.includes('business')) return <Shield className="text-primary-500" size={24} />;
        return <Crown className="text-indigo-500" size={24} />;
    };

    const isCurrentPlan = (plan: any) => {
        if (!currentSub) {
            return Number(plan.price) === 0;
        }
        const normalized = plan.planKey.replace('merchant_', '').replace('customer_', '').toLowerCase();
        return currentSub.plan.toLowerCase() === normalized;
    };

    const getMerchantPlanLevel = (planKey: string) => {
        const key = planKey.replace('merchant_', '').toLowerCase();
        if (key === 'starter') return 0;
        if (key === 'business') return 1;
        if (key === 'premium') return 2;
        return -1;
    };

    const isLowerPlan = (plan: any) => {
        if (!currentSub) return false;
        const currentLevel = getMerchantPlanLevel(currentSub.plan);
        const planLevel = getMerchantPlanLevel(plan.planKey);
        return planLevel < currentLevel;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <CreditCard className="text-primary-600" size={32} />
                    Gói dịch vụ Merchant
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Nâng cấp tài khoản để quản lý nhiều địa điểm hơn.</p>
            </div>

            {currentSub && (
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
                            <div className="text-sm font-medium text-primary-100 mb-1">Quyền lợi hiện tại</div>
                            <div className="text-2xl font-bold">{currentSub.maxPOI} POIs</div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                </div>
            )}

            {!currentSub && defaultMerchantPlan && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 text-amber-800">
                    <AlertCircle className="shrink-0" size={24} />
                    <div className="flex-1">
                        <p className="font-bold">Bạn đang sử dụng gói mặc định ({defaultMerchantPlan.name}).</p>
                        <p className="text-sm opacity-80">{defaultMerchantPlan.description}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {merchantPlans.map((plan) => (
                    <div
                        key={plan.planKey}
                        className={`bg-white rounded-3xl border-2 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${isCurrentPlan(plan)
                            ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg'
                            : 'border-slate-100'
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${Number(plan.price) === 0 ? 'bg-slate-100' : plan.planKey.includes('business') ? 'bg-primary-50' : 'bg-indigo-50'}`}>
                            {getPlanIcon(plan.planKey)}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-2xl font-black text-slate-900">
                                {Number(plan.price) === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(plan.price))}
                            </span>
                            {Number(plan.price) > 0 && <span className="text-slate-400 text-sm">/tháng</span>}
                        </div>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{plan.description}</p>

                        <div className="space-y-4 mb-8 flex-1">
                            <div className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                Quản lý tối đa {plan.maxPOI} địa điểm thuyết minh (POI)
                            </div>
                            {plan.features?.map((f: string, i: number) => (
                                <div key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                    <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                    {f}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePlanClick(plan)}
                            disabled={isSubmitting || isCurrentPlan(plan) || isLowerPlan(plan)}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isCurrentPlan(plan)
                                ? 'bg-emerald-50 text-emerald-600 cursor-default shadow-none border border-emerald-100'
                                : isLowerPlan(plan)
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-100'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95'
                                }`}
                        >
                            {isCurrentPlan(plan) ? (
                                <>Đang sử dụng <Check size={18} /></>
                            ) : isLowerPlan(plan) ? (
                                <>Gói thấp hơn</>
                            ) : Number(plan.price) === 0 ? (
                                <>Sử dụng miễn phí <ArrowRight size={18} /></>
                            ) : (
                                <>Nâng cấp <ArrowRight size={18} /></>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
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
                                <div className="text-left font-bold text-slate-900">
                                    Thanh toán qua Ví MoMo
                                </div>
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
