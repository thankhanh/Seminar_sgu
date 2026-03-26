import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    LogOut,
    Search,
    Bell,
    User as UserIcon,
    MapPin,
    Mic,
    Languages,
    Store,
    Utensils,
    ShieldCheck,
    CreditCard
} from 'lucide-react';

// NavItem used within the sidebar list structure
interface NavItemProps {
    path: string;
    icon: React.ReactNode;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ path, icon, label }) => (
    <li>
        <NavLink
            to={path}
            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                ${isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary-600'}
            `}
        >
            <span className="shrink-0">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
        </NavLink>
    </li>
);


const SidebarLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-background font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-sidebar border-r border-slate-200 flex flex-col fixed h-full z-30">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <LayoutDashboard className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                        Merchant CMS
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto pb-4">
                    {user?.role === 'admin' ? (
                        <>
                            <div className="mb-6">
                                <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hệ thống</h3>
                                <ul className="space-y-1 relative">
                                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" path="/" />
                                    <NavItem icon={<UserIcon size={20} />} label="Người dùng" path="/users" />
                                    <NavItem icon={<ShieldCheck size={20} />} label="Duyệt Merchant" path="/merchants" />
                                    <NavItem icon={<CreditCard size={20} />} label="Quản lý Gói Merchant" path="/subscriptions" />
                                </ul>
                            </div>
                            <div className="mb-6">
                                <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dữ liệu tổng</h3>
                                <ul className="space-y-1 relative">
                                    <NavItem icon={<Store size={20} />} label="Quản lý POI/Store" path="/store" />
                                    <NavItem icon={<Mic size={20} />} label="Quản lý Audio" path="/audio" />
                                    <NavItem icon={<Languages size={20} />} label="Đa ngôn ngữ" path="/translations" />
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cửa hàng của tôi</h3>
                                <ul className="space-y-1 relative">
                                    <NavItem icon={<Store size={20} />} label="Thông tin quán" path="/store-info" />
                                    <NavItem icon={<Utensils size={20} />} label="Quản lý Menu" path="/menu-management" />
                                    <NavItem icon={<CreditCard size={20} />} label="Gói dịch vụ" path="/subscriptions" />
                                </ul>
                            </div>
                            <div className="mb-6">
                                <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nội dung</h3>
                                <ul className="space-y-1 relative">
                                    <NavItem icon={<MapPin size={20} />} label="Vị trí (POI)" path="/poi" />
                                    <NavItem icon={<Mic size={20} />} label="Thuyết minh Audio" path="/audio" />
                                </ul>
                            </div>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all w-full group">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64 flex flex-col">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96 max-w-full">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-primary-500 transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="text-right">
                                <div className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</div>
                                <div className="text-xs text-slate-400 capitalize">{user?.role === 'admin' ? 'Quản trị viên' : 'Đối tác Merchant'}</div>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200 shadow-sm">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="text-slate-400" size={24} />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SidebarLayout;
