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
                            this.setPermission(auth, fileid, email);
                            const description = JSON.stringify(Object.assign(Object.assign({}, response.data), { serviceAccountName }));
                            return this.createShortcut(config.name, fileid, config.parentId, description);
                        }
                        catch (error) {
                            try {
                                this.deleteObject(response.data.id);
                            }
                            finally {
                                throw error;
                            }
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