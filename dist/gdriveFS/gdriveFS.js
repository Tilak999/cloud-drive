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
                    this.log(data);
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
    setPermission(auth, fileId, email, readOnly) {
        this.log("Setting share permission for:", email);
        return drive.permissions.create({
            auth,
            requestBody: {
                type: "user",
                role: readOnly ? "reader" : "owner",
                emailAddress: email,
            },
            transferOwnership: true,
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
            if (!destinationId || destinationId == "")
                throw "Invalid destinationId";
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
                this.setPermission(auth, root, email, true);
            else
                this.removePermission(auth, this._rootDirectory, email);
        });
    }
}
exports.default = GDriveFS;
