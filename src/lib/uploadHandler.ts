import { ICurrentFileProgress, IUploadFileObject } from "@/types/uploadHandler";
import axios from "axios";
import _ from "lodash";



let upload_queue: IUploadFileObject[] = [];
let current_active: ICurrentFileProgress | null;
let completed: ICurrentFileProgress[] = [];
let failed: IUploadFileObject[] = [];

let _onUpdate = console.log;
let isRunning = false;

export function onUpdate(callback: (fileProgress: ICurrentFileProgress) => void) {
    _onUpdate = callback;
}

export function getTransferQueueStatus() {
    return {
        upload_queue,
        current_active,
        completed,
        failed,
    };
}

const uploadFile = async (item: IUploadFileObject) => {
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
        performUploads()
            .then(() => {
                isRunning = false;
            })
            .catch((error) => {
                console.log(error);
            });
    }
};

export default uploadFile;

async function performUploads() {
    while (upload_queue.length > 0) {
        const item = upload_queue.shift();
        if (!item) return;

        const { file, directoryId } = item;
        const relativePath = file.webkitRelativePath;
        const formdata = new FormData();
        formdata.set("files", file);
        formdata.set("relativePath", relativePath);
        formdata.set("directoryId", directoryId);
        await axios
            .post("/api/uploadFiles", formdata, {
                onUploadProgress: (progress) => {
                    console.log("uploading", progress);
                    if (progress && progress.total && progress.loaded) {
                        const percentage = _.round((progress.loaded / progress.total) * 100, 2);
                        current_active = {
                            loaded: progress.loaded,
                            total: progress.total,
                            name: file.name,
                            percentage,
                            directoryId,
                        };
                    } else {
                        console.log("error in reporting progress for:", file.name);
                    }
                },
            })
            .then(() => {
                _onUpdate(current_active);
                if (current_active != null) completed.push(current_active);
                current_active = null;
            })
            .catch((error) => {
                _onUpdate(current_active);
                failed.push(item);
                current_active = null;
            });
    }
}

export function removeFromQueue(fileName: String, directoryId: String) {
    upload_queue = upload_queue.filter(
        (file) => !(file.name === fileName && file.directoryId === directoryId)
    );
}

export function clearCompleted() {
    completed = [];
}

export function clearFailed() {
    failed = [];
}

export function retryUpload(item: IUploadFileObject) {
    failed = failed.filter(
        (file) => !(file.name === item.name && file.directoryId === item.directoryId)
    );
    uploadFile(item);
}
