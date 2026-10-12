import imageCompression from 'browser-image-compression';

export interface CompressImageOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    fileType?: string;
}

export async function compressImage(
    file: File,
    options?: CompressImageOptions,
): Promise<File> {
    const defaultOptions = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };

    try {
        const compressedBlob = await imageCompression(file, mergedOptions);
        return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
            type: 'image/webp',
        });
    } catch {
        return file;
    }
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Gagal mengonversi file ke base64'));
            }
        };
        reader.onerror = (error) => reject(error);
    });
}
