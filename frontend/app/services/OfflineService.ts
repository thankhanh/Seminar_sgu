import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeHelpers, narrationsHelpers, API_URL } from '../constants/api';

const OFFLINE_DIR = `${FileSystem.documentDirectory}offline_cache/`;
const MANIFEST_KEY = '@smart_tour_offline_manifest';

interface OfflineManifest {
    [remoteUrl: string]: string; // URL -> localUri
}

export const OfflineService = {
    /**
     * Kiểm tra dung lượng trống (> 500MB)
     */
    async isStorageSufficient(): Promise<boolean> {
        try {
            const freeStorage = await FileSystem.getFreeDiskStorageAsync();
            const freeMB = freeStorage / (1024 * 1024);
            console.log(`[Offline] Free storage: ${freeMB.toFixed(2)} MB`);
            return freeMB > 500;
        } catch (error) {
            console.error('[Offline] Error checking storage:', error);
            return false;
        }
    },

    /**
     * Khởi tạo thư mục cache
     */
    async ensureDir() {
        const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
        }
    },

    /**
     * Tự động đồng bộ tài nguyên cho ngôn ngữ được chọn
     */
    async syncResources(langCode: string) {
        console.log(`[Offline] Starting sync for language: ${langCode}...`);

        const sufficient = await this.isStorageSufficient();
        if (!sufficient) {
            console.warn('[Offline] Insufficient storage to start sync (>500MB required)');
            return;
        }

        try {
            await this.ensureDir();
            const manifestRaw = await AsyncStorage.getItem(MANIFEST_KEY);
            let manifest: OfflineManifest = manifestRaw ? JSON.parse(manifestRaw) : {};

            // 1. Lấy danh sách quán
            const storeData = await storeHelpers.getStore();
            const stores = storeData.data ?? storeData;

            if (!Array.isArray(stores)) return;

            console.log(`[Offline] Syncing ${stores.length} stores...`);

            for (const store of stores) {
                // A. Tải ảnh bìa
                if (store.coverImage && store.coverImage.startsWith('http')) {
                    const localUri = await this.downloadFile(store.coverImage, manifest);
                    if (localUri) manifest[store.coverImage] = localUri;
                }

                // B. Tải Audio cho ngôn ngữ này (nếu có)
                try {
                    const narrations = await narrationsHelpers.getNarrationsByStoreId(store.id);
                    const matching = narrations.find((n: any) => n.language?.code === langCode);

                    if (matching?.audioUrl && matching.audioUrl.startsWith('http')) {
                        const localAudio = await this.downloadFile(matching.audioUrl, manifest);
                        if (localAudio) manifest[matching.audioUrl] = localAudio;
                    }
                } catch (err) {
                    console.warn(`[Offline] Could not fetch narrations for store ${store.id}`);
                }
            }

            // Lưu manifest mới
            await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
            console.log('[Offline] Sync completed successfully.');
        } catch (error) {
            console.error('[Offline] Sync failed:', error);
        }
    },

    /**
     * Tải một file đơn lẻ và lưu vào manifest
     */
    async downloadFile(url: string, manifest: OfflineManifest): Promise<string | null> {
        // Nếu đã có trong manifest và file vẫn tồn tại, bỏ qua
        if (manifest[url]) {
            const info = await FileSystem.getInfoAsync(manifest[url]);
            if (info.exists) return manifest[url];
        }

        const fileName = url.split('/').pop()?.split('?')[0] || `file_${Math.random().toString(36).slice(2)}`;
        const localUri = OFFLINE_DIR + fileName;

        try {
            const { uri } = await FileSystem.downloadAsync(url, localUri);
            return uri;
        } catch (error) {
            console.warn(`[Offline] Failed to download: ${url}`, error);
            return null;
        }
    },

    /**
     * Giải quyết URL từ xa sang local URI nếu có
     */
    async resolve(remoteUrl: string | null | undefined): Promise<string | null | undefined> {
        if (!remoteUrl || !remoteUrl.startsWith('http')) return remoteUrl;

        try {
            const manifestRaw = await AsyncStorage.getItem(MANIFEST_KEY);
            if (!manifestRaw) return remoteUrl;

            const manifest: OfflineManifest = JSON.parse(manifestRaw);
            const localUri = manifest[remoteUrl];

            if (localUri) {
                const info = await FileSystem.getInfoAsync(localUri);
                if (info.exists) return localUri;
            }
        } catch (e) {
            // Fallback to remote if error
        }
        return remoteUrl;
    },

    /**
     * Xóa toàn bộ dữ liệu offline (Dùng khi Logout)
     */
    async clearCache() {
        console.log('[Offline] Clearing all cached assets...');
        try {
            const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
            if (dirInfo.exists) {
                await FileSystem.deleteAsync(OFFLINE_DIR, { idempotent: true });
            }
            await AsyncStorage.removeItem(MANIFEST_KEY);
            console.log('[Offline] Cache cleared.');
        } catch (error) {
            console.error('[Offline] Failed to clear cache:', error);
        }
    }
};
