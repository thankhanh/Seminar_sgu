import React from 'react';
import {
    TrendingUp,
    Users,
    Store,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, color }) => {
    // Extract base color name from Tailwind class (e.g. 'bg-emerald-500' -> 'emerald')
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
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Chào buổi sáng, Admin!</h1>
                <p className="text-slate-500">Đây là những gì đang diễn ra với hệ thống của bạn ngày hôm nay.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng doanh thu"
                    value="128.450.000 ₫"
                    change="+12.5%"
                    trend="up"
                    icon={<TrendingUp size={24} />}
                    color="bg-primary-500"
                />
                <StatCard
                    title="Người dùng mới"
                    value="1,240"
                    change="+8.2%"
                    trend="up"
                    icon={<Users size={24} />}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Gian hàng mới"
                    value="64"
                    change="-2.4%"
                    trend="down"
                    icon={<Store size={24} />}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Đơn hàng"
                    value="452"
                    change="+14.8%"
                    trend="up"
                    icon={<ShoppingCart size={24} />}
                    color="bg-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-slate-900">Biểu đồ doanh thu</h3>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20">
                            <option>7 ngày qua</option>
                            <option>30 ngày qua</option>
                            <option>Năm nay</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {[40, 65, 45, 90, 55, 75, 85].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-primary-100 rounded-t-lg relative group transition-all duration-500 ease-out overflow-hidden"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute inset-0 bg-primary-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <span className="text-xs text-slate-400 font-medium font-mono">T{i + 2}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Gian hàng nổi bật</h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-slate-400">
                                    S{i}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-900 leading-none mb-1">Cửa hàng số {i}</div>
                                    <div className="text-xs text-slate-400">24 đơn hàng hôm nay</div>
                                </div>
                                <div className="text-sm font-bold text-primary-600">
                                    +1.2M
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 rounded-xl border border-slate-100 text-sm font-bold text-slate-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-100 transition-all">
                        Xem tất cả
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
