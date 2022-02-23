import axios from "axios";
import path from "path";

const upload_queue = [];
let current_active = null;
const completed = [];

let isRunning = false;

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
        directoryPath: item.directoryPath,
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
        const { file, directoryPath } = upload_queue.pop();
        const filename = file.name;
        const basePath = file.webkitRelativePath.replace("/" + filename, "");
        const formdata = new FormData();
        formdata.set("files", file);
        formdata.set("path", path.join(directoryPath, basePath));
        await axios.post("/api/uploadFiles", formdata, {
            onUploadProgress: (progress) => {
                console.log(progress);
                current_active = {
                    loaded: progress.loaded,
                    total: progress.total,
                    name: file.name,
                    percentage: (
                        (progress.loaded / progress.total) *
                        100
                    ).toFixed(2),
                };
            },
        });
        completed.push(current_active);
        current_active = null;
    }
}
