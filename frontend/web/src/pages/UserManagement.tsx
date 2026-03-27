import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, MoreVertical,
    CheckCircle2, XCircle, Shield, Store, Loader2, AlertCircle,
    UserPlus, Mail, Calendar, UserCheck
} from 'lucide-react';
import { adminApi } from '../utils/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import type { User, Merchant } from '../types';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const limit = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Create form state
    const [newUserData, setNewUserData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user' as 'user' | 'merchant' | 'admin',
    });

    const fetchData = async (pageNum = page) => {
        setLoading(true);
        try {
            const [usersRes, merchantsRes] = (await Promise.all([
                adminApi.getUsers(pageNum, limit),
                adminApi.getMerchants(1, 100)
            ])) as any[];
            setUsers(usersRes.data || []);
            setTotalUsers(usersRes.total || 0);
            setMerchants(merchantsRes.data || []);
        } catch (err) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchData(newPage);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleStatus = async (id: string) => {
        try {
            await adminApi.toggleUser(id);
            fetchData();
        } catch (err) {
            alert('Không thể cập nhật trạng thái người dùng');
        }
    };

    const handleApprove = async (merchantId: string) => {
        try {
            await adminApi.approveMerchant(merchantId);
            fetchData();
        } catch (err) {
            alert('Lỗi khi duyệt merchant');
        }
    };

    const handleReject = async (merchantId: string) => {
        const reason = window.prompt('Lý do từ chối:');
        if (reason !== null) {
            try {
                await adminApi.rejectMerchant(merchantId, reason);
                fetchData();
            } catch (err) {
                alert('Lỗi khi từ chối merchant');
            }
        }
    };
    
    const handleCreateUser = async () => {
        if (!newUserData.name || !newUserData.email || !newUserData.password) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc');
            return;
        }
        
        setIsCreating(true);
        try {
            await adminApi.createUser(newUserData);
            alert('Tạo tài khoản thành công!');
            setIsAddUserOpen(false);
            setNewUserData({ name: '', email: '', password: '', role: 'user' });
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi tạo tài khoản');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredUsers = users.filter((user: User) => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700 border border-primary-200"><Shield size={14} /> Quản trị viên</span>;
            case 'merchant':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200"><Store size={14} /> Chủ quán</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"><Users size={14} /> Người dùng</span>;
        }
    };

    const getStatusBadge = (user: User) => {
        if (user.role === 'merchant') {
            const m = merchants.find(merc => merc.userId === user.id);
            if (m) {
                switch (m.status) {
                    case 'approved': return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">Đã duyệt</span>;
                    case 'pending': return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 animate-pulse">Chờ duyệt</span>;
                    case 'rejected': return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700">Đã từ chối</span>;
                    case 'blocked': return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600">Bị khóa</span>;
                }
            }
        }
        
        return user.isActive ? 
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">Hoạt động</span> :
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600">Vô hiệu</span>;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="text-primary-600" size={32} />
                        Quản lý Người dùng
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Kiểm duyệt và quản lý tài khoản người dùng, chủ quán tập trung.</p>
                </div>
                <button 
                    onClick={() => setIsAddUserOpen(true)}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg shadow-primary-500/20 flex items-center gap-2"
                >
                    <UserPlus size={20} />
                    Tạo tài khoản
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600"><Users size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">Tổng người dùng</div>
                        <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Store size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">Yêu cầu Merchant</div>
                        <div className="text-2xl font-bold text-amber-600">{merchants.filter(m => m.status === 'pending').length}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><UserCheck size={24} /></div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">Đang hoạt động</div>
                        <div className="text-2xl font-bold text-emerald-600">{users.filter(u => u.isActive).length}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên hoặc Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm"
                        />
                    </div>
                    <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold flex items-center gap-2">
                        <Filter size={18} /> Bộ lọc nâng cao
                    </button>
                </div>

                <div className="overflow-x-auto min-h-[400px] relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-primary-500" size={40} />
                        </div>
                    )}
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Thông tin User</th>
                                <th className="px-6 py-4">Phân quyền</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tham gia</th>
                                <th className="px-6 py-4 text-right">Lệnh điều khiển</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user: User) => {
                                const merchant = merchants.find(m => m.userId === user.id);
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold flex items-center justify-center shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{user.name}</div>
                                                    <div className="text-slate-500 text-xs flex items-center gap-1"><Mail size={10} /> {user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(user)}</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-300" /> {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {user.role === 'merchant' && merchant?.status === 'pending' && (
                                                    <div className="flex gap-1 mr-2 bg-amber-50 p-1 rounded-lg border border-amber-100">
                                                        <button onClick={() => handleApprove(merchant.id)} className="p-1.5 text-emerald-600 hover:bg-white rounded-md transition-all shadow-sm" title="Duyệt Merchant">
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleReject(merchant.id)} className="p-1.5 text-rose-600 hover:bg-white rounded-md transition-all shadow-sm" title="Từ chối">
                                                            <AlertCircle size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                                {user.role !== 'admin' && (
                                                    <button onClick={() => toggleStatus(user.id)} className={`p-2 rounded-xl transition-all ${user.isActive ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`} title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                                        {user.isActive ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                                                    </button>
                                                )}
                                                <button onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Xem hồ sơ">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users size={40} className="text-slate-200" />
                                            Không tìm thấy người dùng nào phù hợp.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Pagination 
                        currentPage={page} 
                        totalItems={totalUsers} 
                        itemsPerPage={limit} 
                        onPageChange={handlePageChange} 
                    />
                </div>
            </div>

            <Modal 
                isOpen={isAddUserOpen} 
                onClose={() => setIsAddUserOpen(false)}
                title="Khởi tạo tài khoản hệ thống"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và tên</label>
                        <input 
                            type="text" 
                            value={newUserData.name}
                            onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                            placeholder="Nhập tên đầy đủ..." 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-slate-900 transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Email / Identifier</label>
                        <input 
                            type="email" 
                            value={newUserData.email}
                            onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                            placeholder="example@system.com" 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-slate-900 transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Phân quyền hệ thống</label>
                        <select 
                            value={newUserData.role}
                            onChange={e => setNewUserData({...newUserData, role: e.target.value as any})}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-slate-900 transition-all"
                        >
                            <option value="user">Người dùng cuối (User)</option>
                            <option value="merchant">Chủ gian hàng (Merchant)</option>
                            <option value="admin">Quản trị hệ thống (Admin)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu khởi tạo</label>
                        <input 
                            type="password" 
                            value={newUserData.password}
                            onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                            placeholder="Tối thiểu 8 ký tự..." 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-slate-900 transition-all" 
                        />
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => setIsAddUserOpen(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            disabled={isCreating}
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleCreateUser}
                            disabled={isCreating}
                            className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2"
                        >
                            {isCreating && <Loader2 size={18} className="animate-spin" />}
                            {isCreating ? 'Đang khởi tạo...' : 'Khởi tạo ngay'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)}
                title="Hồ sơ chi tiết người dùng"
            >
                <div className="space-y-6">
                    <div className="flex gap-5 items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 text-primary-600 flex items-center justify-center font-bold text-3xl uppercase">
                            {selectedUser?.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-extrabold text-xl text-slate-900">{selectedUser?.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                {selectedUser && getRoleBadge(selectedUser.role)}
                                {selectedUser && getStatusBadge(selectedUser)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Email liên hệ</span>
                                <span className="font-bold text-slate-800">{selectedUser?.email}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Ngày đăng ký</span>
                                <span className="font-bold text-slate-800">{selectedUser && new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Mã định danh</span>
                                <span className="font-mono text-xs text-slate-500">{selectedUser?.id}</span>
                            </div>
                        </div>
                        
                        {selectedUser?.role === 'merchant' && (
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest mb-3">Thông tin kinh doanh</h4>
                                <div className="space-y-2">
                                    <div className="text-sm flex justify-between">
                                        <span className="text-indigo-600 font-medium">Trạng thái Merchant:</span>
                                        <span className="font-bold text-indigo-900 capitalize">{merchants.find(m => m.userId === selectedUser.id)?.status}</span>
                                    </div>
                                    <div className="text-sm flex justify-between">
                                        <span className="text-indigo-600 font-medium">Mã Merchant:</span>
                                        <span className="font-mono text-xs text-indigo-900">{merchants.find(m => m.userId === selectedUser.id)?.id}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <button 
                            onClick={() => setIsDetailOpen(false)}
                            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all w-full shadow-lg shadow-slate-200"
                        >
                            Đóng hồ sơ
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
