export interface FileParameter {
    data: Blob | File;
    fileName: string;
}

export function toFileParameter(file: File): FileParameter {
    return {
        data: file,
        fileName: file.name
    }
}

export function isVideoUrl(url: string): boolean {
    if (!url) return false;

    const cleanUrl = url.split('?')[0].toLowerCase();

    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi'];

    return videoExtensions.some(ext => cleanUrl.endsWith(ext));
}

export function isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
}