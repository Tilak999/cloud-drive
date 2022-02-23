import utils from "../lib/utils";
import path from "path";
import { google } from "googleapis";
import { Stream } from "stream";
const drive = google.drive("v3");

const GFS_PREFIX = "gfs:";
const GFS_METADATA_ROOT_DIR = `${GFS_PREFIX}/_.metadata._`;
const MIME_TYPE_DIRECTORY = "application/vnd.google-apps.folder";
const MIME_TYPE_LINK = "application/vnd.drive-fs.symlink";

// Constants
export const Messages = {
    ALREADY_EXIST: "entity already exist",
    OK: "ok",
    NOT_FOUND: "entity not found",
    DIRECTORY_NOT_EMPTY: "Directory is not Empty",
};

interface DriveFile {
    name: String;
    mimeType: String;
    iconLink: String;
    hasThumbnail: boolean;
    modifiedTime: Date;
    originalFileId: String;
    path: String;
    isDirectory: boolean;
    originalFileProperties: object;
}

interface config {
    masterKeyFile: {
        serviceAccounts: object;
        indexStoreKey: string;
    };
    enableDebugLogs: boolean;
}

interface uploadConfig {
    filename: string;
    filesize: number;
    onUploadProgress: (progress: any) => void;
}

function normaliseFileData(file: any) {
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

function getAbsolutePath(inputPath: string) {
    if (inputPath.indexOf(GFS_METADATA_ROOT_DIR) == -1) {
        return inputPath
            .replace(GFS_PREFIX, GFS_METADATA_ROOT_DIR)
            .trim()
            .replace(/\/$/g, "");
    }
    return inputPath.trim().replace(/\/$/g, "");
}

export default class GdriveFS {
    private _keyFile: any;
    private _debug: boolean = false;
    private _indexAuth: any;
    private _enableDebugLogs: boolean = false;
    private _metadata: any;

    constructor({ masterKeyFile, enableDebugLogs }: config | any) {
        if (!masterKeyFile) throw "KeyFile is required";
        this._keyFile = masterKeyFile["serviceAccounts"];
        this._indexAuth = this._keyFile[masterKeyFile["indexStoreKey"]];
        this._enableDebugLogs = enableDebugLogs;
        this.getIndexDirectory().then((val) => (this._metadata = val));
    }

    async authorize(key: object) {
        const auth = new google.auth.GoogleAuth({
            credentials: key,
            scopes: [
                "https://www.googleapis.com/auth/cloud-platform",
                "https://www.googleapis.com/auth/drive",
            ],
        });
        return await auth.getClient();
    }

    private log(...args: any[]) {
        this._enableDebugLogs && console.log("[grive-fs]", ...args);
    }

    async getIndexDirectory() {
        if (this._metadata) {
            return this._metadata;
        }
        try {
            const auth = await this.authorize(this._indexAuth);
            const { data } = await drive.files.list({
                auth,
                q: `name='${GFS_METADATA_ROOT_DIR}'`,
            });

            if (data != null && data.files != null && data.files.length > 0) {
                this.log("Metadata directory already present");
                return data.files[0];
            } else {
                this.log("creating metadata directory");
                const { data } = await drive.files.create({
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
        } catch (e) {
            this.log("Error: ", e);
            throw e;
        }
    }

    async list(path: string) {
        this._validateGfsPath(path);
        const absPath = getAbsolutePath(path);
        const auth = await this.authorize(this._indexAuth);
        const fields = `files(mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description)`;
        const q = `name='${absPath}'`;
        const resp = await drive.files.list({ auth, fields, q });
        const files = resp.data.files;

        if (files == null || files.length == 0) {
            return {
                status: Messages.NOT_FOUND,
                data: resp.data,
                files: null,
            };
        } else {
            const isDirectory = files[0].mimeType == MIME_TYPE_DIRECTORY;
            if (isDirectory) {
                const directoryId = files[0].id;
                const q = `'${directoryId}' in parents`;
                const result = await drive.files.list({ auth, fields, q });
                if (result.data != null && result.data.files != null)
                    return {
                        status: Messages.OK,
                        files: result.data.files.map(normaliseFileData),
                    };
                else throw "Error while fetching files in directory.";
            } else {
                return {
                    status: Messages.OK,
                    files: [normaliseFileData(files[0])],
                };
            }
        }
    }

    async checkIfEntityExist(path: string, includeData?: boolean) {
        this._validateGfsPath(path);
        const absPath = getAbsolutePath(path);
        const auth = await this.authorize(this._indexAuth);
        const fields = `files(mimeType, id, name, size, modifiedTime, description, parents)`;
        const q = `name='${absPath}'`;
        const resp = await drive.files.list({ auth, fields, q });

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
    }

    async createDirectory(baseDir: string, dirName: string) {
        if (!baseDir || !dirName)
            throw `Parameters required: (baseDir, dirName)`;

        this._validateGfsPath(baseDir);
        const metadata = await this.getIndexDirectory();
        const absPath = getAbsolutePath(path.join(baseDir, dirName));

        // check if parent directory exist
        const parentDir = await this.checkIfEntityExist(
            path.parse(absPath).dir,
            true
        );

        if (!parentDir.exist || !parentDir.isDirectory) {
            throw `Parent directory doesn't exist: ${
                path.parse(path.join(baseDir, dirName)).dir
            }`;
        }

        // check if directory exist
        const directoryExist = await this.checkIfEntityExist(absPath);
        if (!directoryExist) {
            const auth = await this.authorize(this._indexAuth);
            const resp = await drive.files.create({
                auth,
                requestBody: {
                    originalFilename: dirName,
                    name: absPath,
                    mimeType: MIME_TYPE_DIRECTORY,
                    parents: [parentDir.data.symlinkId || metadata.id],
                },
            });
            return {
                status: Messages.OK,
                data: normaliseFileData(resp.data),
            };
        } else {
            return {
                status: Messages.ALREADY_EXIST,
            };
        }
    }

    async getStorageInfo(serviceAuth?: any) {
        const action = async (serviceAuth: any) => {
            const auth = await this.authorize(serviceAuth);
            const resp = await drive.about.get({
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
            } else {
                throw `Failed to fetch storage information for service account ${serviceAuth.client_email}`;
            }
        };
        if (serviceAuth) return action(serviceAuth);
        const promises = Object.keys(this._keyFile).map((serviceAccountName) =>
            action(this._keyFile[serviceAccountName])
        );
        const info = await Promise.all(promises);
        return info.reduce((prev, curr) => {
            return {
                limit: prev.limit + curr.limit,
                usage: prev.usage + curr.usage,
                usageInDrive: prev.usageInDrive + curr.usageInDrive,
            };
        });
    }

    async uploadFile(baseDir: string, stream: Stream, config: uploadConfig) {
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

        const file = await this.checkIfEntityExist(
            path.join(absPath, config.filename),
            true
        );

        if (file.exist) {
            throw "File already exist: " + path.join(baseDir, config.filename);
        }

        const parentDir = await this.checkIfEntityExist(absPath, true);
        if (!parentDir.exist || !parentDir.isDirectory) {
            throw "Base directory doesn't exist: " + baseDir;
        }

        const fields =
            "mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description, webViewLink";

        for (const serviceAccountName of Object.keys(this._keyFile)) {
            //
            if (this._indexAuth.client_email.startsWith(serviceAccountName)) {
                continue;
            }
            const serviceAccountAuth = this._keyFile[serviceAccountName];
            const info = await this.getStorageInfo(serviceAccountAuth);
            const freeSpace = info.limit - info.usage;
            if (freeSpace >= config.filesize) {
                this.log(serviceAccountName, ":", freeSpace);
                // create and upload actual file
                const resp = await drive.files.create(
                    {
                        auth: await this.authorize(serviceAccountAuth),
                        fields,
                        media: { body: stream },
                        requestBody: {
                            originalFilename: config.filename,
                            name: config.filename,
                            description: JSON.stringify({
                                path: path.join(absPath, config.filename),
                            }),
                        },
                    },
                    {
                        onUploadProgress: config.onUploadProgress,
                    }
                );

                if (resp.data == null || resp.data.id == null)
                    throw "File upload failed";

                try {
                    // Create symbolic file in metadata directory
                    const resource = {
                        originalFilename: config.filename,
                        name: path.join(absPath, config.filename),
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
                    const indexDriveAuth = await this.authorize(
                        this._indexAuth
                    );
                    const symlinkResp = await drive.files.create({
                        auth: indexDriveAuth,
                        requestBody: resource,
                        fields,
                    });
                    return {
                        status: Messages.OK,
                        data: normaliseFileData(symlinkResp.data),
                    };
                } catch (e) {
                    this._debug && console.error(e);
                    await this._deleteById(
                        this._keyFile[serviceAccountName],
                        resp.data.id
                    );
                    throw e;
                }
            }
        }
    }

    async deleteFile(filePath: string) {
        this._validateGfsPath(filePath);
        const absPath = getAbsolutePath(filePath);
        const result = await this.checkIfEntityExist(absPath, true);
        if (result.exist && !result.isDirectory) {
            const { symlinkId, fileId, serviceAccountName } = result.data;
            this._deleteById(this._keyFile[serviceAccountName], fileId);
            this._deleteById(this._indexAuth, symlinkId);
            return { status: Messages.OK };
        }
        return { status: Messages.NOT_FOUND };
    }

    async deleteDirectory(filePath: string, force: boolean) {
        this._validateGfsPath(filePath);
        const absPath = getAbsolutePath(filePath);
        if (absPath == GFS_METADATA_ROOT_DIR)
            throw "Root directory can'be deleted";

        const result = await this.checkIfEntityExist(absPath, true);
        let status = Messages.NOT_FOUND;

        if (result.exist && result.isDirectory) {
            const { files } = await this.list(absPath);
            if (files && files.length > 0 && force) {
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
                status = Messages.DIRECTORY_NOT_EMPTY;
            }
            const id = result.data.symlinkId;
            this._deleteById(this._indexAuth, id);
            status = Messages.OK;
        }
        return { status };
    }

    async downloadFile(filePath: string) {
        this._validateGfsPath(filePath);
        const absPath = getAbsolutePath(filePath);
        const result = await this.checkIfEntityExist(absPath, true);

        if (result.exist && !result.isDirectory) {
            const { fileId, serviceAccountName } = result.data;
            const auth = await this.authorize(
                this._keyFile[serviceAccountName]
            );
            const resp = await drive.files.get(
                { auth, fileId: fileId, alt: "media" },
                { responseType: "stream" }
            );
            return {
                status: Messages.OK,
                length: parseInt(resp.headers["content-length"]),
                data: resp.data,
            };
        } else {
            return {
                status: Messages.NOT_FOUND,
            };
        }
    }

    async move(source: string, target: string) {
        if (!source || !target) throw "Parameters required ($source, $target)";
        if (!utils.isValidGfsPath(source) || !utils.isValidGfsPath(target))
            throw `Invalid gfs:/.. path: [${source},${target}]`;
        if (source == target)
            throw `Source and target can't be same: [${source},${target}]`;
        if (target.indexOf(path.join(source, "/")) > -1)
            throw `Illegal operation: Source [${source}] is parent of target [${target}]`;

        const sourceEntity = await this.checkIfEntityExist(source, true);
        const destEntity = await this.checkIfEntityExist(target, true);

        if (destEntity.exist && destEntity.isDirectory && sourceEntity.exist) {
            const auth = await this.authorize(this._indexAuth);
            const absPath = getAbsolutePath(target);
            const name = path.join(absPath, path.basename(source));
            const { data } = await drive.files.update({
                auth,
                removeParents: sourceEntity.data.parents,
                addParents: destEntity.data.symlinkId,
                fileId: sourceEntity.data.symlinkId,
                requestBody: { name },
            });
            return { status: Messages.OK, data };
        } else {
            const message =
                "Destination path is either invalid or not a directory.";
            return { status: Messages.NOT_FOUND, message };
        }
    }

    private async _deleteById(key: any, id: string) {
        const auth = await this.authorize(key);
        return await drive.files.delete({
            auth: auth,
            fileId: id,
        });
    }

    private _validateGfsPath(filePath: string) {
        if (!utils.isValidGfsPath(filePath))
            throw "Invalid gfs:/.. path: " + filePath;
    }

    private async _listAllFiles() {
        const auth = await this.authorize(this._indexAuth);
        const res = await drive.files.list({ auth: auth, fields: "*" });
        this.log(JSON.stringify(res.data, null, 4));
    }

    private async _deleteAllFiles() {
        const auth = await this.authorize(this._indexAuth);
        const res = await drive.files.list({ auth: auth, fields: "*" });
        if (res && res.data && res.data.files) {
            res.data.files.map(async (file) => {
                if (file.id)
                    await drive.files.delete({ auth, fileId: file.id });
            });
        }
    }
}

module.exports = GdriveFS;
