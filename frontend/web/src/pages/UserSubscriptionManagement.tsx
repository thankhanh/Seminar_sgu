import React from 'react';
import { CreditCard } from 'lucide-react';

const UserSubscriptionManagement: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <CreditCard className="text-primary-600" size={32} />
                    Quản lý gói người dùng
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Xem / quản lý các gói của người dùng. (Tính năng tương tự Gói Merchant).</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-600">Đang phát triển nội dung chi tiết cho phần quản lý gói người dùng.</p>
            </div>
        </div>
    );
};

export default UserSubscriptionManagement;
