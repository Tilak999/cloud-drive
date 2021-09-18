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

    return { ...file, ...additionalFields, ...metadata };
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
    // Private Fields
    _keyFile = null;
    _debug = false;
    _indexDrive = null;

    // Constants
    static ALREADY_EXIST = "entity already exist";
    static OK = "ok";
    static NOT_FOUND = "entity not found";
    static DIRECTORY_NOT_EMPTY = "Directory is not Empty";

    constructor({ keyFile, debug }) {
        if (!keyFile) throw "KeyFile is required";
        this._keyFile = keyFile["serviceAccounts"];
        this._debug = debug;
        this._indexDrive = keyFile["indexStoreKey"];
        this.getIndexDirectory();
    }

    async getIndexDirectory() {
        if (this._metadata) return this._metadata;
        else {
            const auth = await authorize(this._indexAuth);
            const resp = await drive.files.list({
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
                const resp = await drive.files.create({ auth, resource });
                this._metadata = resp.data;
            } else {
                this._debug &&
                    console.log("Metadata directory already present");
                this._metadata = resp.data.files[0];
            }
            return this._metadata;
        }
    }

    async list($path, $listDirectoryContents) {
        this._validateGfsPath($path);
        const absPath = getAbsolutePath($path);
        const auth = await authorize(this._indexAuth);
        const fields = `files(mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description)`;
        const q = `name='${absPath}'`;
        const resp = await drive.files.list({ auth, fields, q });
        const files = resp.data.files;

        if (files.length == 0) {
            return {
                status: GdriveFS.NOT_FOUND,
            };
        } else {
            const isDirectory = files[0].mimeType == MIME_TYPE_DIRECTORY;
            if (isDirectory && $listDirectoryContents) {
                const directoryId = files[0].id;
                const q = `'${directoryId}' in parents`;
                const result = await drive.files.list({ auth, fields, q });
                return {
                    status: GdriveFS.OK,
                    files: result.data.files.map(normaliseFileData),
                };
            } else {
                return {
                    status: GdriveFS.OK,
                    files: [normaliseFileData(files[0])],
                };
            }
        }
    }

    async checkIfEntityExist($path, $includeData) {
        this._validateGfsPath($path);
        const absPath = getAbsolutePath($path);
        const auth = await authorize(this._indexAuth);
        const fields = `files(mimeType, id, name, size, modifiedTime, description, parents)`;
        const q = `name='${absPath}'`;
        const resp = await drive.files.list({ auth, fields, q });

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
    }

    async createDirectory($baseDir, $dirName) {
        if (!$baseDir || !$dirName)
            throw `Parameters required: ($baseDir, $dirName)`;

        this._validateGfsPath($baseDir);
        const metadata = await this.getIndexDirectory();
        const absPath = getAbsolutePath(path.join($baseDir, $dirName));

        //check if directory exist
        const directoryExist = await this.checkIfEntityExist(absPath);

        // check if parent directory exist
        const parentDir = await this.checkIfEntityExist(
            path.parse(absPath).dir,
            true
        );

        if (!parentDir.exist || !parentDir.isDirectory)
            throw (
                "Parent directory doesn't exist: " +
                path.parse(path.join($baseDir, $dirName)).dir
            );

        if (!directoryExist) {
            const resource = {
                originalFilename: $dirName,
                name: absPath,
                mimeType: MIME_TYPE_DIRECTORY,
                parents: [parentDir.data.symlinkId || metadata.id],
            };
            const auth = await authorize(this._indexAuth);
            const resp = await drive.files.create({ auth, resource });
            return {
                status: GdriveFS.OK,
                data: normaliseFileData(resp.data),
            };
        } else {
            return {
                status: GdriveFS.ALREADY_EXIST,
            };
        }
    }

    async getStorageInfo(serviceAuth) {
        const action = async (serviceAuth) => {
            const auth = await authorize(serviceAuth);
            const resp = await drive.about.get({
                auth,
                fields: ["storageQuota"],
            });
            const storageInfo = resp.data.storageQuota;
            for (const key of Object.keys(storageInfo)) {
                storageInfo[key] = parseInt(storageInfo[key]);
            }
            return storageInfo;
        };
        if (serviceAuth) return action(serviceAuth);
        const promises = Object.keys(this._keyFile).map((serviceAccountName) =>
            action(this._keyFile[serviceAccountName])
        );
        const info = await Promise.all(promises);
        return info.reduce((prev, curr) => {
            const data = {};
            for (const key of Object.keys(prev)) {
                data[key] = prev[key] + curr[key];
            }
            return data;
        });
    }

    async uploadFile(
        $baseDir,
        $fileStream,
        { filename, filesize, onUploadProgress }
    ) {
        if (!$fileStream || typeof $fileStream != "object")
            throw "$fileStream:ReadStream - Readable file stream is required";

        if (!filename || filename.trim() == "") throw "filename: Required";

        if (!filesize || typeof filesize != "number")
            throw "filesize: Required";

        this._validateGfsPath($baseDir);
        const absPath = getAbsolutePath($baseDir);

        const file = await this.checkIfEntityExist(
            path.join(absPath, filename),
            true
        );

        if (file.exist)
            throw "File already exist: " + path.join($baseDir, filename);

        const parentDir = await this.checkIfEntityExist(absPath, true);
        if (!parentDir.exist || !parentDir.isDirectory)
            throw "Base directory doesn't exist: " + $baseDir;

        const fields =
            "mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description, webViewLink";

        for (const serviceAccountName of Object.keys(this._keyFile)) {
            const serviceAccountAuth = this._keyFile[serviceAccountName];
            const info = await this.getStorageInfo(serviceAccountAuth);
            const freeSpace = info.limit - info.usage;
            if (freeSpace >= filesize) {
                this._debug && console.log(serviceAccountName, ":", freeSpace);
                const auth = await authorize(serviceAccountAuth);

                // create and upload actual file
                const fileMetadata = {
                    originalFilename: filename,
                    name: filename,
                    description: JSON.stringify({
                        path: path.join(absPath, filename),
                    }),
                };
                const resp = await drive.files.create(
                    {
                        auth,
                        fields,
                        media: { body: $fileStream },
                        resource: fileMetadata,
                    },
                    {
                        onUploadProgress,
                    }
                );

                // Add public permission
                await drive.permissions.create({
                    auth,
                    fileId: resp.data.id,
                    requestBody: {
                        type: "anyone",
                        role: "reader",
                    },
                });

                // Create symbolic file in metadata directory
                const resource = {
                    originalFilename: filename,
                    name: path.join(absPath, filename),
                    mimeType: MIME_TYPE_LINK,
                    description: JSON.stringify({
                        serviceAccountName,
                        fileId: resp.data.id,
                        fileSize: resp.data.size,
                        webViewLink: resp.data.webViewLink,
                    }),
                    parents: [parentDir.data.symlinkId],
                };
                const indexDriveAuth = await authorize(this._indexAuth);
                const symlinkResp = await drive.files.create({
                    auth: indexDriveAuth,
                    resource,
                    fields,
                });

                return {
                    status: GdriveFS.OK,
                    data: normaliseFileData(symlinkResp.data),
                };
            }
        }
    }

    async deleteFile($filePath) {
        this._validateGfsPath($filePath);
        const absPath = getAbsolutePath($filePath);
        const result = await this.checkIfEntityExist(absPath, true);
        if (result.exist && !result.isDirectory) {
            const { symlinkId, fileId, serviceAccountName } = result.data;
            this._deleteById(this._keyFile[serviceAccountName], fileId);
            this._deleteById(this._indexAuth, symlinkId);
            return { status: GdriveFS.OK };
        }
        return { status: GdriveFS.NOT_FOUND };
    }

    async deleteDirectory($filePath, $force) {
        this._validateGfsPath($filePath);
        const absPath = getAbsolutePath($filePath);
        if (absPath == GFS_METADATA_ROOT_DIR)
            throw "Root directory can'be deleted";

        const result = await this.checkIfEntityExist(absPath, true);
        let status = GdriveFS.NOT_FOUND;

        if (result.exist && result.isDirectory) {
            const { files } = await this.list(absPath, true);
            if (files.length > 0 && $force) {
                // recursively delete files
                const promises = files.map(async (file) => {
                    if (file.isDirectory) {
                        return await this.deleteDirectory(file.path, true);
                    } else {
                        return this.deleteFile(file.path);
                    }
                });
                await Promise.all(promises);
            } else {
                status = GdriveFS.DIRECTORY_NOT_EMPTY;
            }
            const id = result.data.symlinkId;
            this._deleteById(this._indexAuth, id);
            status = GdriveFS.OK;
        }
        return { status };
    }

    async downloadFile($filePath) {
        this._validateGfsPath($filePath);
        const absPath = getAbsolutePath($filePath);
        const result = await this.checkIfEntityExist(absPath, true);

        if (result.exist && !result.isDirectory) {
            const { fileId, serviceAccountName } = result.data;
            const auth = await authorize(this._keyFile[serviceAccountName]);
            const resp = await drive.files.get(
                { auth, fileId: fileId, alt: "media" },
                { responseType: "stream" }
            );
            return {
                status: GdriveFS.OK,
                length: parseInt(resp.headers["content-length"]),
                data: resp.data,
            };
        } else {
            return {
                status: GdriveFS.NOT_FOUND,
            };
        }
    }

    async move($source, $target) {
        if (!$source || !$target)
            throw "Parameters required ($source, $target)";
        if (!utils.isValidGfsPath($source) || !utils.isValidGfsPath($target))
            throw `Invalid gfs:/.. path: [${$source},${$target}]`;
        if ($source == $target)
            throw `Source and target can't be same: [${$source},${$target}]`;
        if ($target.indexOf(path.join($source, "/")) > -1)
            throw `Illegal operation: Source [${$source}] is parent of target [${$target}]`;

        const sourceEntity = await this.checkIfEntityExist($source, true);
        const destEntity = await this.checkIfEntityExist($target, true);

        if (destEntity.exist && destEntity.isDirectory && sourceEntity.exist) {
            const auth = await authorize(this._indexAuth);
            const absPath = getAbsolutePath($target);
            const name = path.join(absPath, path.basename($source));

            const { data } = await drive.files.update({
                auth,
                removeParents: sourceEntity.data.parents,
                addParents: [destEntity.data.symlinkId],
                fileId: sourceEntity.data.symlinkId,
                resource: { name },
            });
            return { status: GdriveFS.OK, data };
        } else {
            const message =
                "Destination path is either invalid or not a directory.";
            return { status: GdriveFS.NOT_FOUND, message };
        }
    }

    async _deleteById(key, id) {
        const auth = await authorize(key);
        return await drive.files.delete({
            auth: auth,
            fileId: id,
        });
    }

    _validateGfsPath(filePath) {
        if (!utils.isValidGfsPath(filePath))
            throw "Invalid gfs:/.. path: " + filePath;
    }

    async deleteBySymlinkId(id) {
        const fields = `files(mimeType, id, name, size, modifiedTime, description, parents)`;
        const auth = await authorize(this._indexAuth);
        const resp = await drive.files.get({
            auth,
            fileId: id,
            fields,
        });
        const dataFile = JSON.parse(resp.description);
        //await drive.files.delete({ })
    }

    async _listAllFiles() {
        const auth2 = await authorize(this._indexAuth);
        const res2 = await drive.files.list({ auth: auth2, fields: "*" });
        console.log(JSON.stringify(res2.data, null, 4));
    }

    async _deleteAllFiles() {
        const auth2 = await authorize(this._indexAuth);
        const res2 = await drive.files.list({ auth: auth2, fields: "*" });
        res2.data.files.map(async (file) => {
            await drive.files.delete({ auth: auth2, fileId: file.id });
        });
    }
}

module.exports = GdriveFS;
