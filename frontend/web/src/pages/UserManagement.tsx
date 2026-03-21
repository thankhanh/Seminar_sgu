import React, { useState } from 'react';
import {
    Users, Search, Filter, MoreVertical,
    CheckCircle2, XCircle, Shield, Store
} from 'lucide-react';
import Modal from '../components/Modal';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'merchant' | 'user';
    status: 'active' | 'pending' | 'inactive';
    createdAt: string;
}

const mockUsers: UserData[] = [
    { id: '1', name: 'Nguyễn Văn A', email: 'merchant.a@gmail.com', role: 'merchant', status: 'active', createdAt: '2026-03-01' },
    { id: '2', name: 'Trần Thị B', email: 'tran.b@gmail.com', role: 'user', status: 'active', createdAt: '2026-03-05' },
    { id: '3', name: 'Phở Hòa', email: 'phohoa@merchant.com', role: 'merchant', status: 'pending', createdAt: '2026-03-10' },
    { id: '4', name: 'Admin Root', email: 'admin@system.com', role: 'admin', status: 'active', createdAt: '2026-01-01' },
    { id: '5', name: 'Lê Văn C', email: 'le.c@example.com', role: 'user', status: 'inactive', createdAt: '2026-02-15' },
];

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const toggleStatus = (id: string, currentStatus: string) => {
        setUsers(users.map((u: UserData) => {
            if (u.id === id) {
                const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
                return { ...u, status: newStatus as any };
            }
            return u;
        }));
    };

    const approveMerchant = (id: string) => {
        setUsers(users.map((u: UserData) => u.id === id ? { ...u, status: 'active' } : u));
    };

    const filteredUsers = users.filter((user: UserData) => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700"><Shield size={14} /> Quản trị viên</span>;
            case 'merchant':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700"><Store size={14} /> Chủ quán</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"><Users size={14} /> Người dùng</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Hoạt động</span>;
            case 'pending':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Chờ duyệt</span>;
            case 'inactive':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Vô hiệu</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="text-primary-500" />
                        Quản lý Người dùng
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Kiểm duyệt và quản lý tài khoản người dùng, chủ quán.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold flex items-center gap-2 shadow-sm">
                        <Filter size={16} /> Bộ lọc
                    </button>
                    <button 
                        onClick={() => setIsAddUserOpen(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-semibold shadow-sm shadow-primary-500/20"
                    >
                        Thêm tài khoản
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên hoặc Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Tên / Email</th>
                                <th className="px-6 py-4">Vai trò</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user: UserData) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{user.name}</div>
                                                <div className="text-slate-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                                    <td className="px-6 py-4 text-slate-500">{user.createdAt}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.role === 'merchant' && user.status === 'pending' && (
                                                <button onClick={() => approveMerchant(user.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Duyệt chủ quán">
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            {user.role !== 'admin' && (
                                                <button onClick={() => toggleStatus(user.id, user.status)} className={`p-1.5 rounded-lg transition-colors ${user.status === 'active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`} title={user.status === 'active' ? 'Khóa' : 'Mở khóa'}>
                                                    {user.status === 'active' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                                                </button>
                                            )}
                                            <button onClick={() => setIsDetailOpen(true)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Chi tiết"><MoreVertical size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Không tìm thấy người dùng phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <Modal 
                isOpen={isAddUserOpen} 
                onClose={() => setIsAddUserOpen(false)}
                title="Tạo tài khoản mới"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên</label>
                        <input type="text" placeholder="Nhập họ và tên..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email / Tên đăng nhập</label>
                        <input type="email" placeholder="example@gmail.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Vai trò</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                            <option value="user">Người dùng (User)</option>
                            <option value="merchant">Chủ quán (Merchant)</option>
                            <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu khởi tạo</label>
                        <input type="password" placeholder="Nhập mật khẩu..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900" />
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsAddUserOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={() => setIsAddUserOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all"
                        >
                            Tạo tài khoản
                        </button>
                    </div>
                </div>
            </Modal>

            {/* User Detail Modal */}
            <Modal 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)}
                title="Chi tiết người dùng"
            >
                <div className="space-y-5">
                    <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-2xl uppercase">
                            N
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Nguyễn Văn A</h3>
                            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                Hoạt động
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Email:</span>
                            <span className="font-medium text-slate-900">merchant.a@gmail.com</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Vai trò:</span>
                            <span className="font-medium text-indigo-600">Chủ quán</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Ngày tạo:</span>
                            <span className="font-medium text-slate-900">2026-03-01</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold text-slate-500">Lần đăng nhập cuối:</span>
                            <span className="font-medium text-slate-900">Hôm nay 09:30</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setIsDetailOpen(false)}
                            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors w-full"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
