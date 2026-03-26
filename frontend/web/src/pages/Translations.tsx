import React, { useState, useEffect } from 'react';
import { Globe, Loader2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { languagesApi } from '../utils/api';

interface Language {
    id: string;
    name: string;
    code: string;
    isDefault?: boolean;
}

const Translations: React.FC = () => {
    const [isAddLangOpen, setIsAddLangOpen] = useState(false);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    const [newLangData, setNewLangData] = useState({
        name: 'Japanese',
        code: 'ja',
        flagIcon: '🇯🇵'
    });

    const fetchLangs = async () => {
        setLoading(true);
        try {
            const data = await languagesApi.getAll();
            setLanguages(data || []);
        } catch (err) {
            console.error('Lỗi khi tải ngôn ngữ:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLangs();
    }, []);

    const handleCreateLanguage = async () => {
        setIsCreating(true);
        try {
            await languagesApi.create(newLangData);
            alert('Thêm ngôn ngữ thành công!');
            setIsAddLangOpen(false);
            fetchLangs();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi thêm ngôn ngữ');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteLanguage = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa ngôn ngữ này? Hệ thống sẽ mất các bản dịch tương ứng.')) return;
        try {
            await languagesApi.remove(id);
            fetchLangs();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi xóa ngôn ngữ');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý Ngôn ngữ</h1>
                <p className="text-slate-500">Quản lý các ngôn ngữ thuyết minh và bản dịch trên hệ thống.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-full">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Globe size={20} /></div>
                            <h3 className="font-bold text-slate-900">Quản lý ngôn ngữ</h3>
                        </div>
                        <button onClick={() => setIsAddLangOpen(true)} className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline transition-all">+ Thêm ngôn ngữ</button>
                    </div>
                    <div className="space-y-4 relative min-h-[120px]">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-primary-500" size={32} />
                            </div>
                        ) : languages.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4">Chưa có ngôn ngữ nào trong hệ thống.</p>
                        ) : languages.map((lang, i) => (
                            <div key={lang.id} className="p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-sm transition-all bg-slate-50/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate-900">{lang.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-primary-600">
                                            {i === 0 ? 'Mặc định' : lang.code.toUpperCase()}
                                        </span>
                                        {i !== 0 && (
                                            <button 
                                                onClick={() => handleDeleteLanguage(lang.id)}
                                                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 font-mono">{lang.code}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Add Language Modal */}
            <Modal 
                isOpen={isAddLangOpen} 
                onClose={() => setIsAddLangOpen(false)}
                title="Thêm ngôn ngữ mới"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Chọn ngôn ngữ</label>
                        <select 
                            value={newLangData.code} 
                            onChange={e => {
                                const opt = e.target.options[e.target.selectedIndex];
                                setNewLangData({
                                    ...newLangData,
                                    code: e.target.value,
                                    name: opt.text.split(' (')[0],
                                    flagIcon: opt.getAttribute('data-flag') || ''
                                });
                            }}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-slate-900 transition-all font-medium"
                        >
                            <option value="ja" data-flag="🇯🇵">Tiếng Nhật (Japanese)</option>
                            <option value="fr" data-flag="🇫🇷">Tiếng Pháp (French)</option>
                            <option value="de" data-flag="🇩🇪">Tiếng Đức (German)</option>
                            <option value="th" data-flag="🇹🇭">Tiếng Thái (Thai)</option>
                            <option value="ko" data-flag="🇰🇷">Tiếng Hàn (Korean)</option>
                            <option value="zh" data-flag="🇨🇳">Tiếng Trung (Chinese)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Kích hoạt tự động dịch</label>
                        <div className="flex items-start gap-3 mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <input type="checkbox" id="autoTranslate" defaultChecked className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500" />
                            <label htmlFor="autoTranslate" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                                Sử dụng AI để tự động dịch các nội dung hiện tại (POI, Audio, thông tin quán...) sang ngôn ngữ mới này.
                            </label>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => setIsAddLangOpen(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            disabled={isCreating}
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleCreateLanguage}
                            disabled={isCreating}
                            className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2"
                        >
                            {isCreating && <Loader2 size={18} className="animate-spin" />}
                            {isCreating ? 'Đang thêm...' : 'Thêm ngôn ngữ'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Translations;
