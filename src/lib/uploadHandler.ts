import axios from "axios";

interface currentFileProgress {
    loaded: number;
    total: number;
    name: string;
    percentage: number;
    directoryId: string;
}

interface uploadFileObject extends currentFileProgress {
    file: File;
}

const upload_queue: uploadFileObject[] = [];
let current_active: currentFileProgress;
const completed: currentFileProgress[] = [];

let _onUpdate = console.log;
let isRunning = false;

export function onUpdate(callback) {
    _onUpdate = callback;
}

export function getTransferQueueStatus() {
    return {
        upload_queue,
        current_active,
        completed,
    };
}

export default async function uploadFile(item) {
    upload_queue.push({
        name: item.file.name,
        loaded: 0,
        total: item.file.size,
        file: item.file,
        directoryId: item.directoryId,
        percentage: 0,
    });
    if (!isRunning) {
        isRunning = true;
        performUploads().then(() => {
            isRunning = false;
        });
    }
}

async function performUploads() {
    while (upload_queue.length > 0) {
        const { file, directoryId } = upload_queue.pop();
        const relativePath = file.webkitRelativePath;
        const formdata = new FormData();
        formdata.set("files", file);
        formdata.set("relativePath", relativePath);
        formdata.set("directoryId", directoryId);
        await axios.post("/api/uploadFiles", formdata, {
            onUploadProgress: (progress) => {
                const percentage = (progress.loaded / progress.total) * 100;
                current_active = {
                    loaded: progress.loaded,
                    total: progress.total,
                    name: file.name,
                    percentage,
                    directoryId,
                };
            },
        });
        _onUpdate(current_active);
        completed.push(current_active);
        current_active = null;
    }
}
