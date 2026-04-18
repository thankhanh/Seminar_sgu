import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { uploadApi } from '../utils/api';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
    label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, multiple = false, label }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const images = multiple 
        ? (Array.isArray(value) ? value : (value ? [value] : []))
        : (value ? [value as string] : []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file => uploadApi.uploadFile(file));
            const results = await Promise.all(uploadPromises);
            const urls = results.map(res => res.url);

            if (multiple) {
                onChange([...images, ...urls]);
            } else {
                onChange(urls[0]);
            }
        } catch (error) {
            console.error('Lỗi khi upload ảnh:', error);
            alert('Lỗi khi upload ảnh. Vui lòng thử lại!');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        if (multiple) {
            const newImages = [...images];
            newImages.splice(index, 1);
            onChange(newImages);
        } else {
            onChange('');
        }
    };

    const API_BASE = 'http://localhost:3000'; // Match your backend URL

    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider text-[10px]">{label}</label>}
            
            <div className="flex flex-wrap gap-3">
                {/* Image Previews */}
                {images.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                        <img 
                            src={url.startsWith('http') ? url : `${API_BASE}${url}`} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                        />
                        <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                {/* Upload Button */}
                {(multiple || images.length === 0) && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary-600 disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 size={20} className="animate-spin text-primary-500" />
                        ) : (
                            <>
                                {multiple ? <Plus size={20} /> : <Upload size={20} />}
                                <span className="text-[10px] font-bold uppercase">{multiple ? 'Thêm' : 'Tải lên'}</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple={multiple}
                accept="image/*"
                className="hidden"
            />
            
            <p className="text-[10px] text-slate-400 italic">Hỗ trợ JPG, PNG, WebP. Tối đa 5MB/file.</p>
        </div>
    );
};

export default ImageUpload;
