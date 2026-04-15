import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Xóa một file từ thư mục uploads nếu nó tồn tại.
 * @param fileUrl URL của file (ví dụ: '/uploads/file.png') hoặc tên file.
 */
export async function deleteFile(fileUrl: string | null | undefined): Promise<boolean> {
  if (!fileUrl) return false;

  try {
    // Nếu fileUrl bắt đầu bằng 'http', đây là file ngoài hệ thống, không xóa được.
    if (fileUrl.startsWith('http')) return false;

    // Lấy tên file từ URL (ví dụ: '/uploads/123.jpg' -> '123.jpg')
    const filename = fileUrl.replace('/uploads/', '');
    
    // Đường dẫn tuyệt đối đến file (giả định thư mục uploads nằm ở root dự án)
    // Lưu ý: Cwd của server thường là folder backend
    const filePath = join(process.cwd(), 'uploads', filename);

    // Kiểm tra file có tồn tại không trước khi xóa
    await fs.access(filePath);
    await fs.unlink(filePath);
    
    console.log(`[FileUtil] Đã xóa file thành công: ${filePath}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`[FileUtil] File không tồn tại để xóa: ${fileUrl}`);
    } else {
      console.error(`[FileUtil] Lỗi khi xóa file ${fileUrl}:`, error.message);
    }
    return false;
  }
}

/**
 * Xóa nhiều file cùng lúc.
 */
export async function deleteFiles(fileUrls: (string | null | undefined)[]): Promise<void> {
  await Promise.all(fileUrls.map(url => deleteFile(url)));
}
