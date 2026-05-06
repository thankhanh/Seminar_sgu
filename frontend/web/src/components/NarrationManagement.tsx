import React, { useState, useEffect } from 'react';
import { Headphones, Plus, Trash2, Loader2, Languages } from 'lucide-react';
import Modal from './Modal';
import { storesApi, narrationsApi, languagesApi } from '../utils/api';

interface NarrationItem {
    id: string;
    title: string;
    content?: string;
    language: { name: string; code: string };
}

interface Language {
    id: string;
    name: string;
    code: string;
}

interface Props {
    storeId: string;
    storeName?: string;
}

const NarrationManagement: React.FC<Props> = ({ storeId, storeName }) => {
    const [narrations, setNarrations] = useState<NarrationItem[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({ languageId: '', title: '', content: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [narrs, langs] = await Promise.all([
                storesApi.getNarrations(storeId),
                languagesApi.getAll(),
            ]);
            setNarrations(narrs || []);
            setLanguages(langs || []);
        } catch (err) {
            console.error('Lỗi khi tải thuyết minh:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storeId) fetchData();
    }, [storeId]);

    const handleCreate = async () => {
        if (!form.languageId || !form.title) {
            alert('Vui lòng chọn ngôn ngữ và nhập tiêu đề');
            return;
        }
        try {
            setIsSaving(true);
            await storesApi.createNarration(storeId, {
                languageId: form.languageId,
                title: form.title,
                content: form.content,
            });
            setIsAddOpen(false);
            setForm({ languageId: '', title: '', content: '' });
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi tạo thuyết minh');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Xóa bản thuyết minh này?')) return;
        try {
            await narrationsApi.remove(id);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi xóa');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Headphones size={18} className="text-primary-500" />
                    Thuyết minh {storeName ? `— ${storeName}` : ''}
                </h3>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                    <Plus size={16} /> Thêm
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                </div>
            ) : narrations.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">Chưa có bản thuyết minh nào.</p>
            ) : (
                <div className="space-y-2">
                    {[...narrations].sort((a, b) => {
                        if (a.language?.code === 'vi' && b.language?.code !== 'vi') return -1;
                        if (a.language?.code !== 'vi' && b.language?.code === 'vi') return 1;
                        return 0;
                    }).map(n => (
                        <div key={n.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-primary-100 text-primary-600 rounded-lg">
                                    <Languages size={14} />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
                                    <p className="text-xs text-slate-500">{n.language.name} ({n.language.code})</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(n.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Thêm bản thuyết minh">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Ngôn ngữ</label>
                        <select
                            value={form.languageId}
                            onChange={e => setForm({ ...form, languageId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900"
                        >
                            <option value="">Chọn ngôn ngữ...</option>
                            {languages.map((l: Language) => (
                                <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="Tiêu đề bản thuyết minh..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nội dung</label>
                        <textarea
                            rows={4}
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            placeholder="Nhập nội dung cần thuyết minh..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 resize-none"
                        ></textarea>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
                        <button 
                            onClick={handleCreate} 
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-xl font-semibold text-white transition-all flex items-center gap-2 ${
                                isSaving ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                            }`}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                            {isSaving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default NarrationManagement;
