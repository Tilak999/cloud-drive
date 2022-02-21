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
const utils = require("../lib/utils");
const authorize = require("../lib/auth");
const path = require("path");
const { google } = require("googleapis");
const drive = google.drive("v3");
const GFS_PREFIX = "gfs:";
const GFS_METADATA_ROOT_DIR = `${GFS_PREFIX}/_.metadata._`;
const MIME_TYPE_DIRECTORY = "application/vnd.google-apps.folder";
const MIME_TYPE_LINK = "application/vnd.drive-fs.symlink";
function normaliseFileData(file) {
    const additionalFields = {
        symlinkId: file.id,
        path: file.name.replace(GFS_METADATA_ROOT_DIR, GFS_PREFIX),
        name: path.basename(file.name),
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
    constructor({ masterKeyFile, debug }) {
        // Private Fields
        this._keyFile = null;
        this._debug = false;
        this._indexAuth = null;
        if (!masterKeyFile)
            throw "KeyFile is required";
        this._keyFile = masterKeyFile["serviceAccounts"];
        this._indexAuth = this._keyFile[masterKeyFile["indexStoreKey"]];
        this._debug = debug;
        this.getIndexDirectory();
    }
    getIndexDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._metadata)
                return this._metadata;
            else {
                const auth = yield authorize(this._indexAuth);
                const resp = yield drive.files.list({
                    auth,
                    q: `name='${GFS_METADATA_ROOT_DIR}'`,
                });
                if (resp.data.files.length == 0) {
                    this._debug && console.log("creating metadata directory");
                    const resource = {
                        originalFilename: "metadata",
                        name: GFS_METADATA_ROOT_DIR,
                        mimeType: MIME_TYPE_DIRECTORY,
                        parents: ["root"],
                    };
                    const resp = yield drive.files.create({ auth, resource });
                    this._metadata = resp.data;
                }
                else {
                    this._debug &&
                        console.log("Metadata directory already present");
                    this._metadata = resp.data.files[0];
                }
                return this._metadata;
            }
        });
    }
    list($path, $listDirectoryContents) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath($path);
            const absPath = getAbsolutePath($path);
            const auth = yield authorize(this._indexAuth);
            const fields = `files(mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description)`;
            const q = `name='${absPath}'`;
            const resp = yield drive.files.list({ auth, fields, q });
            const files = resp.data.files;
            if (files.length == 0) {
                return {
                    status: GdriveFS.NOT_FOUND,
                };
            }
            else {
                const isDirectory = files[0].mimeType == MIME_TYPE_DIRECTORY;
                if (isDirectory && $listDirectoryContents) {
                    const directoryId = files[0].id;
                    const q = `'${directoryId}' in parents`;
                    const result = yield drive.files.list({ auth, fields, q });
                    return {
                        status: GdriveFS.OK,
                        files: result.data.files.map(normaliseFileData),
                    };
                }
                else {
                    return {
                        status: GdriveFS.OK,
                        files: [normaliseFileData(files[0])],
                    };
                }
            }
        });
    }
    checkIfEntityExist($path, $includeData) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath($path);
            const absPath = getAbsolutePath($path);
            const auth = yield authorize(this._indexAuth);
            const fields = `files(mimeType, id, name, size, modifiedTime, description, parents)`;
            const q = `name='${absPath}'`;
            const resp = yield drive.files.list({ auth, fields, q });
            const fileCount = resp.data.files.length;
            if ($includeData && fileCount > 0) {
                const files = resp.data.files;
                const isDirectory = files[0].mimeType == MIME_TYPE_DIRECTORY;
                return {
                    exist: fileCount > 0,
                    isDirectory,
                    data: fileCount > 0 ? normaliseFileData(files[0]) : null,
                };
            }
            return fileCount > 0;
        });
    }
    createDirectory($baseDir, $dirName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!$baseDir || !$dirName)
                throw `Parameters required: ($baseDir, $dirName)`;
            this._validateGfsPath($baseDir);
            const metadata = yield this.getIndexDirectory();
            const absPath = getAbsolutePath(path.join($baseDir, $dirName));
            //check if directory exist
            const directoryExist = yield this.checkIfEntityExist(absPath);
            // check if parent directory exist
            const parentDir = yield this.checkIfEntityExist(path.parse(absPath).dir, true);
            if (!parentDir.exist || !parentDir.isDirectory)
                throw ("Parent directory doesn't exist: " +
                    path.parse(path.join($baseDir, $dirName)).dir);
            if (!directoryExist) {
                const resource = {
                    originalFilename: $dirName,
                    name: absPath,
                    mimeType: MIME_TYPE_DIRECTORY,
                    parents: [parentDir.data.symlinkId || metadata.id],
                };
                const auth = yield authorize(this._indexAuth);
                const resp = yield drive.files.create({ auth, resource });
                return {
                    status: GdriveFS.OK,
                    data: normaliseFileData(resp.data),
                };
            }
            else {
                return {
                    status: GdriveFS.ALREADY_EXIST,
                };
            }
        });
    }
    getStorageInfo(serviceAuth) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = (serviceAuth) => __awaiter(this, void 0, void 0, function* () {
                const auth = yield authorize(serviceAuth);
                const resp = yield drive.about.get({
                    auth,
                    fields: ["storageQuota"],
                });
                const storageInfo = resp.data.storageQuota;
                for (const key of Object.keys(storageInfo)) {
                    storageInfo[key] = parseInt(storageInfo[key]);
                }
                return storageInfo;
            });
            if (serviceAuth)
                return action(serviceAuth);
            const promises = Object.keys(this._keyFile).map((serviceAccountName) => action(this._keyFile[serviceAccountName]));
            const info = yield Promise.all(promises);
            return info.reduce((prev, curr) => {
                const data = {};
                for (const key of Object.keys(prev)) {
                    data[key] = prev[key] + curr[key];
                }
                return data;
            });
        });
    }
    uploadFile($baseDir, $fileStream, { filename, filesize, onUploadProgress }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!$fileStream || typeof $fileStream != "object")
                throw "$fileStream:ReadStream - Readable file stream is required";
            if (!filename || filename.trim() == "")
                throw "filename: Required";
            if (!filesize || typeof filesize != "number")
                throw "filesize: Required";
            this._validateGfsPath($baseDir);
            const absPath = getAbsolutePath($baseDir);
            const file = yield this.checkIfEntityExist(path.join(absPath, filename), true);
            if (file.exist)
                throw "File already exist: " + path.join($baseDir, filename);
            const parentDir = yield this.checkIfEntityExist(absPath, true);
            if (!parentDir.exist || !parentDir.isDirectory)
                throw "Base directory doesn't exist: " + $baseDir;
            const fields = "mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description, webViewLink";
            for (const serviceAccountName of Object.keys(this._keyFile)) {
                if (this._indexAuth.client_email.startsWith(serviceAccountName))
                    continue;
                const serviceAccountAuth = this._keyFile[serviceAccountName];
                const info = yield this.getStorageInfo(serviceAccountAuth);
                const freeSpace = info.limit - info.usage;
                if (freeSpace >= filesize) {
                    this._debug && console.log(serviceAccountName, ":", freeSpace);
                    const auth = yield authorize(serviceAccountAuth);
                    // create and upload actual file
                    const resp = yield drive.files.create({
                        auth,
                        fields,
                        media: { body: $fileStream },
                        resource: {
                            originalFilename: filename,
                            name: filename,
                            description: JSON.stringify({
                                path: path.join(absPath, filename),
                            }),
                        },
                    }, {
                        onUploadProgress,
                    });
                    if (resp.data == null || resp.data.id == null)
                        throw "File upload failed";
                    try {
                        // Create symbolic file in metadata directory
                        const resource = {
                            originalFilename: filename,
                            name: path.join(absPath, filename),
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
                        const indexDriveAuth = yield authorize(this._indexAuth);
                        const symlinkResp = yield drive.files.create({
                            auth: indexDriveAuth,
                            resource,
                            fields,
                        });
                        return {
                            status: GdriveFS.OK,
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
    deleteFile($filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath($filePath);
            const absPath = getAbsolutePath($filePath);
            const result = yield this.checkIfEntityExist(absPath, true);
            if (result.exist && !result.isDirectory) {
                const { symlinkId, fileId, serviceAccountName } = result.data;
                this._deleteById(this._keyFile[serviceAccountName], fileId);
                this._deleteById(this._indexAuth, symlinkId);
                return { status: GdriveFS.OK };
            }
            return { status: GdriveFS.NOT_FOUND };
        });
    }
    deleteDirectory($filePath, $force) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath($filePath);
            const absPath = getAbsolutePath($filePath);
            if (absPath == GFS_METADATA_ROOT_DIR)
                throw "Root directory can'be deleted";
            const result = yield this.checkIfEntityExist(absPath, true);
            let status = GdriveFS.NOT_FOUND;
            if (result.exist && result.isDirectory) {
                const { files } = yield this.list(absPath, true);
                if (files.length > 0 && $force) {
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
                    status = GdriveFS.DIRECTORY_NOT_EMPTY;
                }
                const id = result.data.symlinkId;
                this._deleteById(this._indexAuth, id);
                status = GdriveFS.OK;
            }
            return { status };
        });
    }
    downloadFile($filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateGfsPath($filePath);
            const absPath = getAbsolutePath($filePath);
            const result = yield this.checkIfEntityExist(absPath, true);
            if (result.exist && !result.isDirectory) {
                const { fileId, serviceAccountName } = result.data;
                const auth = yield authorize(this._keyFile[serviceAccountName]);
                const resp = yield drive.files.get({ auth, fileId: fileId, alt: "media" }, { responseType: "stream" });
                return {
                    status: GdriveFS.OK,
                    length: parseInt(resp.headers["content-length"]),
                    data: resp.data,
                };
            }
            else {
                return {
                    status: GdriveFS.NOT_FOUND,
                };
            }
        });
    }
    move($source, $target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!$source || !$target)
                throw "Parameters required ($source, $target)";
            if (!utils.isValidGfsPath($source) || !utils.isValidGfsPath($target))
                throw `Invalid gfs:/.. path: [${$source},${$target}]`;
            if ($source == $target)
                throw `Source and target can't be same: [${$source},${$target}]`;
            if ($target.indexOf(path.join($source, "/")) > -1)
                throw `Illegal operation: Source [${$source}] is parent of target [${$target}]`;
            const sourceEntity = yield this.checkIfEntityExist($source, true);
            const destEntity = yield this.checkIfEntityExist($target, true);
            if (destEntity.exist && destEntity.isDirectory && sourceEntity.exist) {
                const auth = yield authorize(this._indexAuth);
                const absPath = getAbsolutePath($target);
                const name = path.join(absPath, path.basename($source));
                const { data } = yield drive.files.update({
                    auth,
                    removeParents: sourceEntity.data.parents,
                    addParents: [destEntity.data.symlinkId],
                    fileId: sourceEntity.data.symlinkId,
                    resource: { name },
                });
                return { status: GdriveFS.OK, data };
            }
            else {
                const message = "Destination path is either invalid or not a directory.";
                return { status: GdriveFS.NOT_FOUND, message };
            }
        });
    }
    _deleteById(key, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield authorize(key);
            return yield drive.files.delete({
                auth: auth,
                fileId: id,
            });
        });
    }
    _validateGfsPath(filePath) {
        if (!utils.isValidGfsPath(filePath))
            throw "Invalid gfs:/.. path: " + filePath;
    }
    _listAllFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const auth2 = yield authorize(this._indexAuth);
            const res2 = yield drive.files.list({ auth: auth2, fields: "*" });
            this._debug && console.log(JSON.stringify(res2.data, null, 4));
        });
    }
    _deleteAllFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const auth2 = yield authorize(this._indexAuth);
            const res2 = yield drive.files.list({ auth: auth2, fields: "*" });
            res2.data.files.map((file) => __awaiter(this, void 0, void 0, function* () {
                yield drive.files.delete({ auth: auth2, fileId: file.id });
            }));
        });
    }
}
// Constants
GdriveFS.ALREADY_EXIST = "entity already exist";
GdriveFS.OK = "ok";
GdriveFS.NOT_FOUND = "entity not found";
GdriveFS.DIRECTORY_NOT_EMPTY = "Directory is not Empty";
module.exports = GdriveFS;
