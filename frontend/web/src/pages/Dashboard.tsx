import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    Users,
    Store,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Crown,
    Headphones,
    Medal
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../utils/api';

interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, color }) => {
    const baseColor = color.split('-')[1] || 'primary';
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${baseColor}-100 rounded-full blur-2xl -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 ring-1 ring-${baseColor}-500/10`}>
                    {React.cloneElement(icon as any, { className: color.replace('bg-', 'text-') })}
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {change}
                </div>
            </div>
            <div className="text-slate-500 text-sm font-medium mb-1 relative z-10">{title}</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight relative z-10">{value}</div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'merchant') {
            navigate('/store-info', { replace: true });
        }

        const fetchStats = async () => {
            if (user?.role === 'admin') {
                try {
                    const data = await adminApi.getStats();
                    setStats(data);
                } catch (err) {
                    console.error('Lỗi khi lấy thống kê:', err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchStats();
    }, [user?.role, navigate]);

    if (user?.role !== 'admin' && user?.role !== 'merchant') {
        return <Navigate to="/unauthorized" replace />;
    }

    if (user?.role !== 'admin') {
        return null;
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Chào buổi sáng, {user?.name || 'Admin'}!</h1>
                    <p className="text-slate-500">Đây là những gì đang diễn ra với hệ thống của bạn ngày hôm nay.</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cập nhật lúc</div>
                    <div className="text-sm font-bold text-slate-900">{new Date().toLocaleTimeString('vi-VN')}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* POI Ranking */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl opacity-50"></div>
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 flex-shrink-0 z-10">
                        <Headphones size={28} />
                    </div>
                    <div className="z-10 overflow-hidden">
                        <div className="text-sm font-bold text-slate-500 mb-1 tracking-wide">POI ĐC NGHE NHIỀU NHẤT THÁNG</div>
                        <div className="text-lg font-black text-slate-900 truncate" title={stats?.topPOI?.name || 'Chưa có thông tin'}>{stats?.topPOI?.name || 'Chưa có thông tin'}</div>
                        <div className="text-sm font-bold text-rose-600 mt-1">{stats?.topPOI?.count || 0} lượt nghe</div>
                    </div>
                </div>

                {/* Merchant Ranking */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-50"></div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 flex-shrink-0 z-10">
                        <Crown size={28} />
                    </div>
                    <div className="z-10 overflow-hidden">
                        <div className="text-sm font-bold text-slate-500 mb-1 tracking-wide">MERCHANT CÓ NHIỀU POI NHẤT</div>
                        <div className="text-lg font-black text-slate-900 truncate" title={stats?.topMerchant?.name || 'Chưa có thông tin'}>{stats?.topMerchant?.name || 'Chưa có thông tin'}</div>
                        <div className="text-sm font-bold text-amber-600 mt-1">{stats?.topMerchant?.count || 0} gian hàng</div>
                    </div>
                </div>

                {/* Client Ranking */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50"></div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100 flex-shrink-0 z-10">
                        <Medal size={28} />
                    </div>
                    <div className="z-10 overflow-hidden">
                        <div className="text-sm font-bold text-slate-500 mb-1 tracking-wide">KHÁCH NGHE NHIỀU NHẤT THÁNG</div>
                        <div className="text-lg font-black text-slate-900 truncate" title={stats?.topClient?.name || 'Chưa có thông tin'}>{stats?.topClient?.name || 'Chưa có thông tin'}</div>
                        <div className="text-sm font-bold text-indigo-600 mt-1">{stats?.topClient?.count || 0} lượt nghe</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng doanh thu"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    change={`${stats?.revenueGrowth >= 0 ? '+' : ''}${stats?.revenueGrowth || 0}%`}
                    trend={stats?.revenueGrowth >= 0 ? 'up' : 'down'}
                    icon={<TrendingUp size={24} />}
                    color="bg-primary-500"
                />
                <StatCard
                    title="Người dùng"
                    value={stats?.userCount || 0}
                    change={`${stats?.userGrowth >= 0 ? '+' : ''}${stats?.userGrowth || 0}%`}
                    trend={stats?.userGrowth >= 0 ? 'up' : 'down'}
                    icon={<Users size={24} />}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Gian hàng"
                    value={stats?.storeCount || 0}
                    change={`${stats?.storeGrowth >= 0 ? '+' : ''}${stats?.storeGrowth || 0}%`}
                    trend={stats?.storeGrowth >= 0 ? 'up' : 'down'}
                    icon={<Store size={24} />}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Giao dịch"
                    value={stats?.transactionCount || 0}
                    change={`${stats?.transactionGrowth >= 0 ? '+' : ''}${stats?.transactionGrowth || 0}%`}
                    trend={stats?.transactionGrowth >= 0 ? 'up' : 'down'}
                    icon={<ShoppingCart size={24} />}
                    color="bg-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-lg font-bold text-slate-900">Biểu đồ tăng trưởng</h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold ring-1 ring-primary-100">Dữ liệu thời gian thực</span>
                        </div>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-3 px-4 relative z-10">
                        {(stats?.monthlyRevenue || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).map((revenue: number, i: number) => {
                            const maxVal = Math.max(...(stats?.monthlyRevenue || [100]));
                            const height = maxVal > 0 ? (revenue / maxVal) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-slate-50 rounded-t-lg relative group transition-all duration-700 ease-out overflow-hidden"
                                        style={{ height: `${Math.max(height, 5)}%`, transitionDelay: `${i * 50}ms` }}
                                        title={formatCurrency(revenue)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary-600 to-indigo-500 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold font-mono">T{((new Date().getMonth() - 11 + i + 12) % 12) + 1}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-30"></div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Store className="text-amber-500" size={20} />
                        Hệ quản trị merchant
                    </h3>
                    <div className="space-y-6 flex-1">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-sm font-bold text-slate-600 mb-1">Cần phê duyệt</div>
                            <div className="text-2xl font-black text-amber-600">{stats?.merchantCountPending || 0}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-sm font-bold text-slate-600 mb-1">Cửa hàng đang mở</div>
                            <div className="text-2xl font-black text-emerald-600">{stats?.storeCountActive || 0}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/users')}
                        className="w-full mt-8 py-3 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
                    >
                        Quản lý hệ thống
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
