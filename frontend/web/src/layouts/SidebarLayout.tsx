import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Search,
    Bell,
    User,
    MapPin,
    Mic,
    Map as MapIcon,
    Languages
} from 'lucide-react';

interface SidebarItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${isActive
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary-600'}
    `}
    >
        <span className="shrink-0">{icon}</span>
        <span className="font-medium">{label}</span>
    </NavLink>
);

const SidebarLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-background font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-sidebar border-r border-slate-200 flex flex-col fixed h-full z-30">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <LayoutDashboard className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                        Vinh Khanh
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">CMS Management</div>
                    <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Tổng quan" />
                    <SidebarItem to="/poi" icon={<MapPin size={20} />} label="Quản lý POI" />
                    <SidebarItem to="/audio" icon={<Mic size={20} />} label="Quản lý Audio" />
                    <SidebarItem to="/tours" icon={<MapIcon size={20} />} label="Quản lý Tour" />
                    <SidebarItem to="/translations" icon={<Languages size={20} />} label="Bản dịch & Lịch sử" />

                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mt-8 mb-2">Hệ thống</div>
                    <SidebarItem to="/users" icon={<Users size={20} />} label="Người dùng" />
                    <SidebarItem to="/settings" icon={<Settings size={20} />} label="Cài đặt" />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all w-full">
                        <LogOut size={20} />
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
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <div className="text-right">
                                <div className="text-sm font-semibold text-slate-900">Admin Hung</div>
                                <div className="text-xs text-slate-400">Quản trị viên</div>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200">
                                <User className="text-slate-400" size={24} />
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
