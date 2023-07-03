import axios from 'axios';

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

let upload_queue: uploadFileObject[] = [];
let current_active: currentFileProgress;
let completed: currentFileProgress[] = [];
let failed: currentFileProgress[] = [];

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
		failed
	};
}

export default async function uploadFile(item) {
	upload_queue.push({
		name: item.file.name,
		loaded: 0,
		total: item.file.size,
		file: item.file,
		directoryId: item.directoryId,
		percentage: 0
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
}

async function performUploads() {
	while (upload_queue.length > 0) {
		const { file, directoryId } = upload_queue.shift();
		const relativePath = file.webkitRelativePath;
		const formdata = new FormData();
		formdata.set('files', file);
		formdata.set('relativePath', relativePath);
		formdata.set('directoryId', directoryId);
		await axios
			.post('/api/uploadFiles', formdata, {
				onUploadProgress: (progress) => {
					const percentage = (progress.loaded / progress.total) * 100;
					current_active = {
						loaded: progress.loaded,
						total: progress.total,
						name: file.name,
						percentage,
						directoryId
					};
				}
			})
			.then(() => {
				_onUpdate(current_active);
				completed.push(current_active);
				current_active = null;
			})
			.catch(function (error) {
				onUpdate(current_active);
				failed.push(current_active);
				current_active = null;
			});
	}
}

export function removeFromQueue(fileName, directoryId) {
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
