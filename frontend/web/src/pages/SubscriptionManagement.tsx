import React, { useState, useEffect } from 'react';
import {
    CreditCard, Check, Zap, Shield, Crown,
    AlertCircle, Loader2, User as UserIcon, Building,
    Calendar
} from 'lucide-react';
import { subscriptionsApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionManagement: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [activeTab, setActiveTab] = useState<'merchant' | 'customer'>('merchant');
    const [currentSub, setCurrentSub] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Plan Metadata state
    const [planMetadata, setPlanMetadata] = useState<any[]>([]);
    
    // Admin state
    const [records, setRecords] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditPlanModal, setShowEditPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [email, setEmail] = useState(''); // merchant email or user email
    const [selectedPlan, setSelectedPlan] = useState('');

    useEffect(() => {
        fetchPlanMetadata();
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchRecords();
        } else {
            fetchMySubscription();
        }
    }, [isAdmin, activeTab, page]);

    const fetchPlanMetadata = async () => {
        try {
            const data = await subscriptionsApi.getAllPlanMetadata() as any;
            setPlanMetadata(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Lỗi khi lấy cấu hình gói:', err);
        }
    };

    const getPlans = () => {
        const prefix = activeTab === 'merchant' ? 'merchant_' : 'customer_';
        return (planMetadata || [])
            .filter(p => p.planKey.startsWith(prefix))
            .sort((a, b) => a.price - b.price) // Free plans first
            .map(p => ({
                ...p,
                id: p.planKey.replace(prefix, ''),
                price: p.price.toLocaleString('vi-VN') + 'đ',
                icon: p.icon === 'Zap' ? <Zap className="text-slate-400" size={24} /> :
                      p.icon === 'Shield' ? <Shield className="text-primary-500" size={24} /> :
                      <Crown className="text-indigo-500" size={24} />
            }));
    };

    const plans = getPlans();

    const fetchMySubscription = async () => {
        setLoading(true);
        try {
            // Merchants only fetch their own
            const data = await subscriptionsApi.getMyMerchant() as any;
            setCurrentSub(data);
        } catch (err) {
            console.error('Lỗi khi lấy thông tin gói:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const result = (activeTab === 'merchant' 
                ? await subscriptionsApi.getAllMerchants(page, 10)
                : await subscriptionsApi.getAllUsers(page, 10)) as any;
            
            setRecords(result.data || []);
            setTotalRecords(result.total || 0);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách gói:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubscription = async () => {
        if (!email || !selectedPlan) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            if (activeTab === 'merchant') {
                await subscriptionsApi.createMerchantByAdmin({ email: email, plan: selectedPlan });
            } else {
                await subscriptionsApi.createUser({ email: email, plan: selectedPlan });
            }
            alert('Cấp gói thành công');
            setShowAddModal(false);
            fetchRecords();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi cấp gói');
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn hủy gói này?')) return;
        try {
            if (activeTab === 'merchant') {
                await subscriptionsApi.cancelMerchant(id);
            } else {
                await subscriptionsApi.cancelUser(id);
            }
            fetchRecords();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi hủy gói');
        }
    };

    const handleUpdatePlanMetadata = async () => {
        if (!editingPlan) return;
        try {
            const features = editingPlan.featuresString 
                ? editingPlan.featuresString.split('\n').filter((f: string) => f.trim() !== '')
                : editingPlan.features;

            await subscriptionsApi.updatePlanMetadata(editingPlan.planKey, {
                name: editingPlan.name,
                price: parseFloat(editingPlan.price.toString().replace(/[^0-9]/g, '')),
                description: editingPlan.description,
                maxPOI: parseInt(editingPlan.maxPOI),
                features: features,
            });
            alert('Cập nhật cấu hình thành công');
            setShowEditPlanModal(false);
            fetchPlanMetadata();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi cập nhật cấu hình');
        }
    };

    if (loading && !records.length && isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-500" size={40} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <CreditCard className="text-primary-600" size={32} />
                        Quản lý Gói Dịch vụ
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {isAdmin ? 'Quản lý danh sách đăng ký của hệ thống' : 'Thông tin gói dịch vụ hiện tại của bạn'}
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => {
                            setEmail('');
                            setSelectedPlan('');
                            setShowAddModal(true);
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition flex items-center gap-2"
                    >
                        <Zap size={18} />
                        Cấp gói mới
                    </button>
                )}
            </div>

            {/* Tab Navigation (Admin only) */}
            {isAdmin && (
                <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200 shadow-inner">
                    <button
                        onClick={() => { setActiveTab('merchant'); setPage(1); }}
                        className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'merchant'
                            ? 'bg-white text-primary-600 shadow-md scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Building size={18} />
                        Merchant (Chủ quán)
                    </button>
                    <button
                        onClick={() => { setActiveTab('customer'); setPage(1); }}
                        className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'customer'
                            ? 'bg-white text-primary-600 shadow-md scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <UserIcon size={18} />
                        Khách hàng (User)
                    </button>
                </div>
            )}

            {/* Plan Cards (Shown to everyone) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.planKey}
                        className={`bg-white rounded-3xl border-2 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${currentSub?.plan === plan.id ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-100'
                            }`}
                    >
                        <div className={`w-14 h-14 ${plan.color} rounded-2xl flex items-center justify-center mb-6`}>
                            {plan.icon}
                        </div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                        </div>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{plan.description}</p>

                        <div className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature: string, i: number) => (
                                <div key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                    <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                    {feature}
                                </div>
                            ))}
                            {(activeTab === 'merchant' || isAdmin) && (
                                <div className="flex items-start gap-3 text-sm font-bold text-primary-600 bg-primary-50 p-2 rounded-lg">
                                    <Zap size={16} className="shrink-0 mt-0.5" />
                                    Giới hạn: {plan.maxPOI} địa điểm (POI)
                                </div>
                            )}
                        </div>

                        {isAdmin ? (
                            <button
                                onClick={() => {
                                    setEditingPlan({
                                        ...plan, 
                                        price: plan.price.replace('đ', '').replace(/\./g, ''),
                                        featuresString: (plan.features || []).join('\n')
                                    });
                                    setShowEditPlanModal(true);
                                }}
                                className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg"
                            >
                                Sửa
                            </button>
                        ) : (
                            <button
                                disabled={currentSub?.plan === plan.id}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${currentSub?.plan === plan.id
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl'
                                    }`}
                            >
                                {currentSub?.plan === plan.id ? 'Đang sử dụng' : 'Nâng cấp ngay'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {isAdmin && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Calendar className="text-primary-600" size={24} />
                            Danh sách Bản ghi Đăng ký
                        </h2>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            {activeTab === 'merchant' ? 'Tiệm / Doanh nghiệp' : 'Khách hàng'}
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Loại Gói</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời hạn</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.length > 0 ? (
                                        records.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">
                                                        {activeTab === 'merchant' 
                                                            ? record.merchant?.businessName 
                                                            : record.user?.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {activeTab === 'merchant' 
                                                            ? record.merchant?.user?.email 
                                                            : record.user?.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 uppercase">
                                                        {record.plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-700">
                                                        {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                        record.status === 'active' 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                            : 'bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}>
                                                        {record.status === 'active' ? 'Đang hoạt động' : 'Đã hủy/Hết hạn'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {record.status === 'active' && (
                                                        <button 
                                                            onClick={() => handleCancel(record.id)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-bold transition"
                                                        >
                                                            Hủy gói
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">
                                                Chưa có dữ liệu đăng ký nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination for Admin */}
            {isAdmin && totalRecords > 10 && (
                <div className="mt-8 flex justify-center items-center gap-2 pb-8">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 text-slate-600 font-semibold transition"
                    >
                        Trước
                    </button>
                    <span className="px-6 py-2 bg-slate-50 rounded-xl text-slate-600 font-bold border border-slate-100">
                        Trang {page}
                    </span>
                    <button 
                        disabled={page * 10 >= totalRecords}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 text-slate-600 font-semibold transition"
                    >
                        Sau
                    </button>
                </div>
            )}

            {/* Edit Plan Modal (Admin) */}
            {showEditPlanModal && editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Chỉnh sửa nội dung gói</h2>
                            <button onClick={() => setShowEditPlanModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <AlertCircle size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Tên gói</label>
                                <input
                                    value={editingPlan.name}
                                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Giá (VNĐ)</label>
                                <input
                                    type="number"
                                    value={editingPlan.price}
                                    onChange={(e) => setEditingPlan({...editingPlan, price: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            {activeTab === 'merchant' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Giới hạn POI (Số lượng)</label>
                                    <input
                                        type="number"
                                        value={editingPlan.maxPOI}
                                        onChange={(e) => setEditingPlan({...editingPlan, maxPOI: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                                <textarea
                                    value={editingPlan.description}
                                    onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 h-20 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Tính năng (Mỗi dòng 1 tính năng)</label>
                                <textarea
                                    value={editingPlan.featuresString}
                                    onChange={(e) => setEditingPlan({...editingPlan, featuresString: e.target.value})}
                                    placeholder="Tối đa 5 địa điểm (POI)&#10;Ưu tiên hiển thị trên bản đồ..."
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 h-32 text-sm leading-relaxed"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setShowEditPlanModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdatePlanMetadata}
                                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Subscription Modal (Admin) */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Cấp gói {activeTab === 'merchant' ? 'Tiệm' : 'Khách hàng'}</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <AlertCircle size={24} />
                            </button>
                        </div>
                        
                        <p className="text-slate-500 text-sm mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                            Nhập Email của {activeTab === 'merchant' ? 'Merchant' : 'Khách hàng'} để tạo bản ghi đăng ký mới.
                        </p>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <UserIcon size={16} className="text-slate-400" />
                                    Email {activeTab === 'merchant' ? 'Merchant' : 'Khách hàng'}
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Ví dụ: merchant@example.com"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <Zap size={16} className="text-slate-400" />
                                    Chọn gói đăng ký
                                </label>
                                <select
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition shadow-sm appearance-none cursor-pointer"
                                >
                                    <option value="">-- Chọn gói phù hợp --</option>
                                    {activeTab === 'merchant' ? (
                                        <>
                                            <option value="starter">Starter (Mặc định)</option>
                                            <option value="business">Business (Nâng cấp 1)</option>
                                            <option value="premium">Premium (Nâng cấp 2)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="free">Gói Miễn phí (Default)</option>
                                            <option value="monthly">Gói Tháng (Monthly)</option>
                                            <option value="yearly">Gói Năm (Yearly)</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleAddSubscription}
                                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition"
                            >
                                Xác nhận cấp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
