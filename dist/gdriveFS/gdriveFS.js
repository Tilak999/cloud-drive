"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const drive = googleapis_1.google.drive("v3");
const MIME_TYPE_DIRECTORY = "application/vnd.google-apps.folder";
const MIME_TYPE_LINK = "application/vnd.google-apps.shortcut";
const fields = "mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description, webViewLink";
class GDriveFS {
    constructor({ masterKeyFile, enableDebugLogs }) {
        this._enableDebugLogs = false;
        this._rootDirectory = "";
        if (!masterKeyFile)
            throw "KeyFile is required";
        this._keyFile = masterKeyFile["serviceAccounts"];
        this._indexAuth = this._keyFile[masterKeyFile["indexStoreKey"]];
        this._enableDebugLogs = enableDebugLogs;
        this.getOrCreateRootDirectory().then((id) => {
            this.log(`Root folder id: ${id}`);
            this._rootDirectory = id;
        });
    }
    getRootDir() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._rootDirectory != "")
                return this._rootDirectory;
            else {
                const id = yield this.getOrCreateRootDirectory();
                return id;
            }
        });
    }
    log(...args) {
        this._enableDebugLogs && console.log("[grive-fs]", ...args);
    }
    authorize(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = new googleapis_1.google.auth.GoogleAuth({
                credentials: key,
                scopes: [
                    "https://www.googleapis.com/auth/cloud-platform",
                    "https://www.googleapis.com/auth/drive",
                ],
            });
            return yield auth.getClient();
        });
    }
    getOrCreateRootDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.authorize(this._indexAuth);
            const { data } = yield drive.files.list({
                auth,
                q: `name='gdrive-fs' and 'root' in parents`,
            });
            let resp = null;
            if (data != null && data.files != null && data.files.length > 0) {
                this.log("Root folder already exist");
                resp = data.files[0];
            }
            else {
                this.log("creating root directory");
                const { data } = yield drive.files.create({
                    auth,
                    requestBody: {
                        name: "gdrive-fs",
                        mimeType: MIME_TYPE_DIRECTORY,
                        parents: ["root"],
                    },
                });
                resp = data;
            }
            if (resp != null && resp.id != null) {
                return resp.id;
            }
            else {
                throw "Can't fetch folderId of `gdrive-fs`";
            }
        });
    }
    checkIfObjectExist(parent, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.authorize(this._indexAuth);
            const { data } = yield drive.files.list({
                auth,
                q: `'${parent}' in parents AND name='${name}'`,
            });
            if (data && data.files && data.files.length > 0) {
                return { exist: true, data: data.files[0] };
            }
            else {
                return { exist: false };
            }
        });
    }
    getObject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.authorize(this._indexAuth);
            try {
                const { data } = yield drive.files.get({
                    fileId: id,
                    fields: "*",
                    auth,
                });
                return data;
            }
            catch (e) {
                return null;
            }
        });
    }
    list(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.authorize(this._indexAuth);
            try {
                const { data } = yield drive.files.list({
                    auth,
                    fields: "*",
                    q: `'${id}' in parents`,
                    orderBy: `folder, name, modifiedTime`,
                });
                if (data && data.files) {
                    this.log("Number of items fetched:", data.files.length);
                    return data.files || [];
                }
                else {
                    return [];
                }
            }
            catch (e) {
                if (e.code == 404)
                    return [];
                else
                    throw e;
            }
        });
    }
    getFilesAndFolders(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parentId == null || parentId == "") {
                parentId = yield this.getRootDir();
            }
            return this.list(parentId);
        });
    }
    createFolder(folderName, parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (folderName == null || folderName == "")
                throw "Invalid folder name";
            if (parentId == null || parentId == "") {
                parentId = yield this.getRootDir();
            }
            const resp = yield this.checkIfObjectExist(parentId, folderName);
            if (!resp.exist) {
                const { data } = yield drive.files.create({
                    auth: yield this.authorize(this._indexAuth),
                    requestBody: {
                        name: folderName,
                        mimeType: MIME_TYPE_DIRECTORY,
                        parents: [parentId],
                    },
                });
                this.log(`Folder created: ${folderName} at id:${parentId}`);
                return data;
            }
            else {
                throw "Folder already exist";
            }
        });
    }
    setPermission(auth, fileId, email) {
        this.log("Setting share permission for:", email);
        return drive.permissions.create({
            auth,
            requestBody: {
                type: "user",
                role: "reader",
                emailAddress: email,
            },
            fileId,
            fields: "*",
            sendNotificationEmail: false,
        });
    }
    removePermission(auth, fileId, email) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield drive.permissions.list({
                auth,
                fileId,
            });
            const permission = (_a = data.permissions) === null || _a === void 0 ? void 0 : _a.find((permission) => permission.emailAddress == email);
            if (permission && permission.id) {
                return drive.permissions.delete({
                    auth,
                    permissionId: permission.id,
                    fileId,
                    fields: "*",
                });
            }
        });
    }
    upload(config) {
        const payload = {
            auth: config.auth,
            fields: "*",
            media: { body: config.file },
            requestBody: {
                name: `${config.parent}/${config.name}`,
            },
        };
        return drive.files.create(payload, {
            onUploadProgress: config.progress,
        });
    }
    getStorageInfo(serviceAuth) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = (serviceAuth) => __awaiter(this, void 0, void 0, function* () {
                const auth = yield this.authorize(serviceAuth);
                const resp = yield drive.about.get({
                    auth,
                    fields: "storageQuota",
                });
                const storageInfo = resp.data.storageQuota;
                if (storageInfo != null) {
                    const { limit, usage, usageInDrive } = storageInfo;
                    return {
                        limit: parseFloat(limit || "0"),
                        usage: parseFloat(usage || "0"),
                        usageInDrive: parseFloat(usageInDrive || "0"),
                    };
                }
                else {
                    throw `Failed to fetch storage information for service account ${serviceAuth.client_email}`;
                }
            });
            if (serviceAuth)
                return action(serviceAuth);
            const promises = Object.keys(this._keyFile).map((serviceAccountName) => action(this._keyFile[serviceAccountName]));
            const info = yield Promise.all(promises);
            return info.reduce((prev, curr) => {
                return {
                    limit: prev.limit + curr.limit,
                    usage: prev.usage + curr.usage,
                    usageInDrive: prev.usageInDrive + curr.usageInDrive,
                };
            });
        });
    }
    validate(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config.name == null || config.name == "") {
                throw "File name is required.";
            }
            if (config.size == null) {
                throw "File size is required.";
            }
            if (config.parentId) {
                const { exist } = yield this.checkIfObjectExist(config.parentId, config.name);
                if (exist)
                    throw "File with same name already present";
            }
            else {
                throw "Parent folder id is required.";
            }
        });
    }
    uploadFile(filestream, config) {
        return __awaiter(this, void 0, void 0, function* () {
            config.parentId = config.parentId || (yield this.getRootDir());
            const email = this._indexAuth.client_email;
            yield this.validate(config);
            for (const serviceAccountName of Object.keys(this._keyFile)) {
                if (email.startsWith(serviceAccountName))
                    continue;
                const serviceAccountAuth = this._keyFile[serviceAccountName];
                const info = yield this.getStorageInfo(serviceAccountAuth);
                const freeSpace = info.limit - info.usage;
                if (freeSpace >= config.size) {
                    this.log(`Uploading [${serviceAccountName}][free space: ${freeSpace}]`);
                    const auth = yield this.authorize(serviceAccountAuth);
                    const response = yield this.upload({
                        auth,
                        file: filestream,
                        parent: config.parentId,
                        name: config.name,
                        progress: config.progress,
                    });
                    if (response.data != null && response.data.id != null) {
                        const fileid = response.data.id;
                        try {
                            yield this.setPermission(auth, fileid, email);
                            const description = JSON.stringify(Object.assign(Object.assign({}, response.data), { serviceAccountName }));
                            return this.createShortcut(config.name, fileid, config.parentId, description);
                        }
                        catch (error) {
                            yield drive.files.delete({
                                auth,
                                fileId: fileid,
                            });
                        }
                    }
                    else {
                        throw `File [${config.name}] upload failed`;
                    }
                }
            }
            throw "Drive full add additional service account and retry";
        });
    }
    createShortcut(name, fileid, parent, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const shortcutMetadata = {
                auth: yield this.authorize(this._indexAuth),
                resource: {
                    name,
                    mimeType: MIME_TYPE_LINK,
                    description,
                    shortcutDetails: {
                        targetId: fileid,
                    },
                    parents: [parent],
                },
            };
            const resp = yield drive.files.create(shortcutMetadata);
            if (resp.data == null) {
                throw "Failed to create shortcut";
            }
            return resp.data;
        });
    }
    deleteFile(id, fileData) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = fileData;
            if (id && id != "") {
                data = yield this.getObject(id);
            }
            if (data && data.id) {
                const targetFile = JSON.parse(data.description || "");
                this.log("Deleting file: " + data.name);
                const cred = this._keyFile[targetFile.serviceAccountName];
                try {
                    yield drive.files.delete({
                        auth: yield this.authorize(cred),
                        fileId: targetFile.id,
                    });
                }
                catch (e) {
                    if (e.code != 404)
                        throw e;
                }
                yield drive.files.delete({
                    auth: yield this.authorize(this._indexAuth),
                    fileId: data.id,
                });
            }
        });
    }
    deleteObject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id || id == "")
                throw `[deleteObject] Invalid id: ${id}`;
            const data = yield this.getObject(id);
            if (data && data.id) {
                if (data.mimeType == MIME_TYPE_DIRECTORY) {
                    this.log("Deleting folder: " + data.name);
                    const files = yield this.list(data.id);
                    for (const file of files) {
                        if (file.id) {
                            if (file.mimeType == MIME_TYPE_DIRECTORY)
                                yield this.deleteObject(file.id);
                            else
                                yield this.deleteFile(file.id);
                        }
                    }
                    return drive.files.delete({
                        auth: yield this.authorize(this._indexAuth),
                        fileId: data.id,
                    });
                }
                else {
                    return this.deleteFile(data.id);
                }
            }
            else {
                throw "Object not found";
            }
        });
    }
    move(sourceId, destinationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sourceId || sourceId == "")
                throw "Invalid sourceId";
            if (!destinationId || destinationId == "") {
                destinationId = yield this.getRootDir();
            }
            const src = yield this.getObject(sourceId);
            const dest = yield this.getObject(destinationId);
            if (src && dest) {
                if (dest.mimeType != MIME_TYPE_DIRECTORY) {
                    throw "DestinationId is not a directory.";
                }
                const auth = yield this.authorize(this._indexAuth);
                const { data } = yield drive.files.update({
                    auth,
                    removeParents: `${src.parents && src.parents[0]}`,
                    addParents: `${destinationId}`,
                    fileId: `${src.id}`,
                });
                return data;
            }
            else {
                throw "Invalid sourceId or destinationId";
            }
        });
    }
    rename(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id || id == "")
                throw "Invalid file/folder id";
            const auth = yield this.authorize(this._indexAuth);
            const { data } = yield drive.files.update({
                auth,
                fileId: id,
                requestBody: {
                    name,
                },
            });
            return data;
        });
    }
    download(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fileId && fileId.trim() != "") {
                const fileData = yield this.getObject(fileId);
                if (fileData && fileData.mimeType == MIME_TYPE_LINK) {
                    const targetFileData = JSON.parse(fileData.description || "");
                    const auth = yield this.authorize(this._keyFile[targetFileData.serviceAccountName]);
                    const resp = yield drive.files.get({ auth, fileId: targetFileData.id, alt: "media" }, { responseType: "stream" });
                    return {
                        name: fileData.name,
                        length: parseInt(resp.headers["content-length"]),
                        data: resp.data,
                    };
                }
            }
            else {
                throw "File not found";
            }
        });
    }
    shareDrive(email, revoke) {
        return __awaiter(this, void 0, void 0, function* () {
            const root = (yield this.getOrCreateRootDirectory()) || this._rootDirectory;
            const auth = yield this.authorize(this._indexAuth);
            if (!revoke)
                this.setPermission(auth, root, email);
            else
                this.removePermission(auth, this._rootDirectory, email);
        });
    }
}
exports.default = GDriveFS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2RyaXZlRlMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2RyaXZlRlMvZ2RyaXZlRlMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBOEM7QUFHOUMsTUFBTSxLQUFLLEdBQUcsbUJBQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFakMsTUFBTSxtQkFBbUIsR0FBRyxvQ0FBb0MsQ0FBQztBQUNqRSxNQUFNLGNBQWMsR0FBRyxzQ0FBc0MsQ0FBQztBQUM5RCxNQUFNLE1BQU0sR0FDUiw0R0FBNEcsQ0FBQztBQUVqSCxNQUFNLFFBQVE7SUFNVixZQUFZLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBTztRQUgzQyxxQkFBZ0IsR0FBWSxLQUFLLENBQUM7UUFDbEMsbUJBQWMsR0FBVyxFQUFFLENBQUM7UUFHaEMsSUFBSSxDQUFDLGFBQWE7WUFBRSxNQUFNLHFCQUFxQixDQUFDO1FBQ2hELElBQUksQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBVSxFQUFFLEVBQUU7WUFDaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFSyxVQUFVOztZQUNaLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxFQUFFO2dCQUFFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztpQkFDckQ7Z0JBQ0QsTUFBTSxFQUFFLEdB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