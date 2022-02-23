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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = void 0;
const utils_1 = require("../lib/utils");
const path_1 = __importDefault(require("path"));
const googleapis_1 = require("googleapis");
const drive = googleapis_1.google.drive("v3");
const GFS_PREFIX = "gfs:";
const GFS_METADATA_ROOT_DIR = `${GFS_PREFIX}/_.metadata._`;
const MIME_TYPE_DIRECTORY = "application/vnd.google-apps.folder";
const MIME_TYPE_LINK = "application/vnd.drive-fs.symlink";
// Constants
exports.Messages = {
    ALREADY_EXIST: "entity already exist",
    OK: "ok",
    NOT_FOUND: "entity not found",
    DIRECTORY_NOT_EMPTY: "Directory is not Empty",
};
function normaliseFileData(file) {
    const additionalFields = {
        symlinkId: file.id,
        path: file.name.replace(GFS_METADATA_ROOT_DIR, GFS_PREFIX),
        name: path_1.default.basename(file.name),
        isDirectory: file.mimeType == MIME_TYPE_DIRECTORY,
    };
    const metadata = file.description ? JSON.parse(file.description) : {};
    delete file.description;
    delete file.size;
    delete file.id;
    return Object.assign(Object.assign(Object.assign({}, file), additionalFields), metadata);
}
function getAbsolutePath(inputPath) {
    if (inputPath.indexOf(GFS_METADATA_ROOT_DIR) == -1) {
        return inputPath
            .replace(GFS_PREFIX, GFS_METADATA_ROOT_DIR)
            .trim()
            .replace(/\/$/g, "");
    }
    return inputPath.trim().replace(/\/$/g, "");
}
class GdriveFS {
    constructor({ masterKeyFile, enableDebugLogs }) {
        this._debug = false;
        this._enableDebugLogs = false;
        if (!masterKeyFile)
            throw "KeyFile is required";
        this._keyFile = masterKeyFile["serviceAccounts"];
        this._indexAuth = this._keyFile[masterKeyFile["indexStoreKey"]];
        this._enableDebugLogs = enableDebugLogs;
        this.getIndexDirectory().then((val) => (this._metadata = val));
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
    log(...args) {
        this._enableDebugLogs && console.log("[grive-fs]", ...args);
    }
    getIndexDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._metadata) {
                return this._metadata;
            }
            try {
                const auth = yield this.authorize(this._indexAuth);
                const { data } = yield drive.files.list({
                    auth,
                    q: `name='${GFS_METADATA_ROOT_DIR}'`,
                });
                if (data != null && data.files != null && data.files.length > 0) {
                    this.log("Metadata directory already present");
                    return data.files[0];
                }
                else {
                    this.log("creating metadata directory");
                    const { data } = yield drive.files.create({
                        auth,
                        requestBody: {
                            originalFilename: "metadata",
                            name: GFS_METADATA_ROOT_DIR,
                            mimeType: MIME_TYPE_DIRECTORY,
                            parents: ["root"],
                        },
                    });
                    return data;
                }
            }
            catch (e) {
                this.log("Error: ", e);
                throw e;
            }
        });
    }
    list(path) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath(path);
            const absPath = getAbsolutePath(path);
            const auth = yield this.authorize(this._indexAuth);
            const fields = `files(mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description)`;
            const q = `name='${absPath}'`;
            const resp = yield drive.files.list({ auth, fields, q });
            const files = resp.data.files;
            if (files == null || files.length == 0) {
                return {
                    status: exports.Messages.NOT_FOUND,
                    data: resp.data,
                    files: null,
                };
            }
            else {
                const isDirectory = files[0].mimeType == MIME_TYPE_DIRECTORY;
                if (isDirectory) {
                    const directoryId = files[0].id;
                    const q = `'${directoryId}' in parents`;
                    const result = yield drive.files.list({ auth, fields, q });
                    if (result.data != null && result.data.files != null)
                        return {
                            status: exports.Messages.OK,
                            files: result.data.files.map(normaliseFileData),
                        };
                    else
                        throw "Error while fetching files in directory.";
                }
                else {
                    return {
                        status: exports.Messages.OK,
                        files: [normaliseFileData(files[0])],
                    };
                }
            }
        });
    }
    checkIfEntityExist(path, includeData) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath(path);
            const absPath = getAbsolutePath(path);
            const auth = yield this.authorize(this._indexAuth);
            const fields = `files(mimeType, id, name, size, modifiedTime, description, parents)`;
            const q = `name='${absPath}'`;
            const resp = yield drive.files.list({ auth, fields, q });
            if (resp.data != null && resp.data.files != null) {
                const fileCount = resp.data.files.length;
                if (includeData && fileCount > 0) {
                    const files = resp.data.files;
                    const isDirectory = files[0].mimeType == MIME_TYPE_DIRECTORY;
                    return {
                        exist: fileCount > 0,
                        isDirectory,
                        data: fileCount > 0 ? normaliseFileData(files[0]) : null,
                    };
                }
                return { exist: fileCount > 0 };
            }
            return { exist: false };
        });
    }
    createDirectory(baseDir, dirName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!baseDir || !dirName)
                throw `Parameters required: (baseDir, dirName)`;
            this._validateGfsPath(baseDir);
            const metadata = yield this.getIndexDirectory();
            const absPath = getAbsolutePath(path_1.default.join(baseDir, dirName));
            // check if parent directory exist
            const parentDir = yield this.checkIfEntityExist(path_1.default.parse(absPath).dir, true);
            if (!parentDir.exist || !parentDir.isDirectory) {
                throw `Parent directory doesn't exist: ${path_1.default.parse(path_1.default.join(baseDir, dirName)).dir}`;
            }
            // check if directory exist
            const directoryExist = yield this.checkIfEntityExist(absPath);
            if (!directoryExist) {
                const auth = yield this.authorize(this._indexAuth);
                const resp = yield drive.files.create({
                    auth,
                    requestBody: {
                        originalFilename: dirName,
                        name: absPath,
                        mimeType: MIME_TYPE_DIRECTORY,
                        parents: [parentDir.data.symlinkId || metadata.id],
                    },
                });
                return {
                    status: exports.Messages.OK,
                    data: normaliseFileData(resp.data),
                };
            }
            else {
                return {
                    status: exports.Messages.ALREADY_EXIST,
                };
            }
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
    uploadFile(baseDir, stream, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!stream || typeof stream != "object") {
                throw "$fileStream:ReadStream - Readable file stream is required";
            }
            if (!config.filename || config.filename.trim() == "") {
                throw "filename: Required";
            }
            if (!config.filesize || typeof config.filesize != "number")
                throw "filesize: Required";
            this._validateGfsPath(baseDir);
            const absPath = getAbsolutePath(baseDir);
            const file = yield this.checkIfEntityExist(path_1.default.join(absPath, config.filename), true);
            if (file.exist) {
                throw "File already exist: " + path_1.default.join(baseDir, config.filename);
            }
            const parentDir = yield this.checkIfEntityExist(absPath, true);
            if (!parentDir.exist || !parentDir.isDirectory) {
                throw "Base directory doesn't exist: " + baseDir;
            }
            const fields = "mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description, webViewLink";
            for (const serviceAccountName of Object.keys(this._keyFile)) {
                //
                if (this._indexAuth.client_email.startsWith(serviceAccountName)) {
                    continue;
                }
                const serviceAccountAuth = this._keyFile[serviceAccountName];
                const info = yield this.getStorageInfo(serviceAccountAuth);
                const freeSpace = info.limit - info.usage;
                if (freeSpace >= config.filesize) {
                    this.log(serviceAccountName, ":", freeSpace);
                    // create and upload actual file
                    const resp = yield drive.files.create({
                        auth: yield this.authorize(serviceAccountAuth),
                        fields,
                        media: { body: stream },
                        requestBody: {
                            originalFilename: config.filename,
                            name: config.filename,
                            description: JSON.stringify({
                                path: path_1.default.join(absPath, config.filename),
                            }),
                        },
                    }, {
                        onUploadProgress: config.onUploadProgress,
                    });
                    if (resp.data == null || resp.data.id == null)
                        throw "File upload failed";
                    try {
                        // Create symbolic file in metadata directory
                        const resource = {
                            originalFilename: config.filename,
                            name: path_1.default.join(absPath, config.filename),
                            mimeType: MIME_TYPE_LINK,
                            description: JSON.stringify({
                                serviceAccountName,
                                mimeType: resp.data.mimeType,
                                iconLink: resp.data.iconLink,
                                fileId: resp.data.id,
                                fileSize: resp.data.size,
                                webViewLink: resp.data.webViewLink,
                            }),
                            parents: [parentDir.data.symlinkId],
                        };
                        const indexDriveAuth = yield this.authorize(this._indexAuth);
                        const symlinkResp = yield drive.files.create({
                            auth: indexDriveAuth,
                            requestBody: resource,
                            fields,
                        });
                        return {
                            status: exports.Messages.OK,
                            data: normaliseFileData(symlinkResp.data),
                        };
                    }
                    catch (e) {
                        this._debug && console.error(e);
                        yield this._deleteById(this._keyFile[serviceAccountName], resp.data.id);
                        throw e;
                    }
                }
            }
        });
    }
    deleteFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath(filePath);
            const absPath = getAbsolutePath(filePath);
            const result = yield this.checkIfEntityExist(absPath, true);
            if (result.exist && !result.isDirectory) {
                const { symlinkId, fileId, serviceAccountName } = result.data;
                this._deleteById(this._keyFile[serviceAccountName], fileId);
                this._deleteById(this._indexAuth, symlinkId);
                return { status: exports.Messages.OK };
            }
            return { status: exports.Messages.NOT_FOUND };
        });
    }
    deleteDirectory(filePath, force) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath(filePath);
            const absPath = getAbsolutePath(filePath);
            if (absPath == GFS_METADATA_ROOT_DIR)
                throw "Root directory can'be deleted";
            const result = yield this.checkIfEntityExist(absPath, true);
            let status = exports.Messages.NOT_FOUND;
            if (result.exist && result.isDirectory) {
                const { files } = yield this.list(absPath);
                if (files && files.length > 0 && force) {
                    // recursively delete files
                    const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                        if (file.isDirectory) {
                            return yield this.deleteDirectory(file.path, true);
                        }
                        else {
                            return this.deleteFile(file.path);
                        }
                    }));
                    yield Promise.all(promises);
                }
                else {
                    status = exports.Messages.DIRECTORY_NOT_EMPTY;
                }
                const id = result.data.symlinkId;
                this._deleteById(this._indexAuth, id);
                status = exports.Messages.OK;
            }
            return { status };
        });
    }
    downloadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath(filePath);
            const absPath = getAbsolutePath(filePath);
            const result = yield this.checkIfEntityExist(absPath, true);
            if (result.exist && !result.isDirectory) {
                const { fileId, serviceAccountName } = result.data;
                const auth = yield this.authorize(this._keyFile[serviceAccountName]);
                const resp = yield drive.files.get({ auth, fileId: fileId, alt: "media" }, { responseType: "stream" });
                return {
                    status: exports.Messages.OK,
                    length: parseInt(resp.headers["content-length"]),
                    data: resp.data,
                };
            }
            else {
                return {
                    status: exports.Messages.NOT_FOUND,
                };
            }
        });
    }
    move(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!source || !target)
                throw "Parameters required ($source, $target)";
            if (!(0, utils_1.isValidGfsPath)(source) || !(0, utils_1.isValidGfsPath)(target))
                throw `Invalid gfs:/.. path: [${source},${target}]`;
            if (source == target)
                throw `Source and target can't be same: [${source},${target}]`;
            if (target.indexOf(path_1.default.join(source, "/")) > -1)
                throw `Illegal operation: Source [${source}] is parent of target [${target}]`;
            const sourceEntity = yield this.checkIfEntityExist(source, true);
            const destEntity = yield this.checkIfEntityExist(target, true);
            if (destEntity.exist && destEntity.isDirectory && sourceEntity.exist) {
                const auth = yield this.authorize(this._indexAuth);
                const absPath = getAbsolutePath(target);
                const name = path_1.default.join(absPath, path_1.default.basename(source));
                const { data } = yield drive.files.update({
                    auth,
                    removeParents: sourceEntity.data.parents,
                    addParents: destEntity.data.symlinkId,
                    fileId: sourceEntity.data.symlinkId,
                    requestBody: { name },
                });
                return { status: exports.Messages.OK, data };
            }
            else {
                const message = "Destination path is either invalid or not a directory.";
                return { status: exports.Messages.NOT_FOUND, message };
            }
        });
    }
    _deleteById(key, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.authorize(key);
            return yield drive.files.delete({
                auth: auth,
                fileId: id,
            });
        });
    }
    _validateGfsPath(filePath) {
        if (!(0, utils_1.isValidGfsPath)(filePath))
            throw "Invalid gfs:/.. path: " + filePath;
    }
    _listAllFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.authorize(this._indexAuth);
            const res = yield drive.files.list({ auth: auth, fields: "*" });
            this.log(JSON.stringify(res.data, null, 4));
        });
    }
    _deleteAllFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.authorize(this._indexAuth);
            const res = yield drive.files.list({ auth: auth, fields: "*" });
            if (res && res.data && res.data.files) {
                res.data.files.map((file) => __awaiter(this, void 0, void 0, function* () {
                    if (file.id)
                        yield drive.files.delete({ auth, fileId: file.id });
                }));
            }
        });
    }
}
exports.default = GdriveFS;
module.exports = GdriveFS;
