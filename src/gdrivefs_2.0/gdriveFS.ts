import { google } from "googleapis";
import { Stream } from "stream";
import { FileConfig } from "./types";
const drive = google.drive("v3");

const MIME_TYPE_DIRECTORY = "application/vnd.google-apps.folder";
const MIME_TYPE_LINK = "application/vnd.google-apps.shortcut";

class GDriveFS {
    private _keyFile: any;
    private _indexAuth: any;
    private _enableDebugLogs: boolean = false;
    private _rootDirectory: string = "";

    constructor({ masterKeyFile, enableDebugLogs }: any) {
        if (!masterKeyFile) throw "KeyFile is required";
        this._keyFile = masterKeyFile["serviceAccounts"];
        this._indexAuth = this._keyFile[masterKeyFile["indexStoreKey"]];
        this._enableDebugLogs = enableDebugLogs;
        this.getOrCreateRootDirectory().then((id: string) => {
            this.log(`Root folder id: ${id}`);
            this._rootDirectory = id;
        });
    }

    async getRootDir() {
        if (this._rootDirectory != "") return this._rootDirectory;
        else {
            const id: string = await this.getOrCreateRootDirectory();
            return id;
        }
    }

    private log(...args: any[]) {
        this._enableDebugLogs && console.log("[grive-fs]", ...args);
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

    private async getOrCreateRootDirectory() {
        const auth = await this.authorize(this._indexAuth);
        const { data } = await drive.files.list({
            auth,
            q: `name='gdrive-fs' and 'root' in parents`,
        });
        let resp: any = null;
        if (data != null && data.files != null && data.files.length > 0) {
            this.log("Root folder already exist");
            resp = data.files[0];
        } else {
            this.log("creating root directory");
            const { data } = await drive.files.create({
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
        } else {
            throw "Can't fetch folderId of `gdrive-fs`";
        }
    }

    async checkIfObjectExist(parent: string, name: string) {
        const auth = await this.authorize(this._indexAuth);
        const { data } = await drive.files.list({
            auth,
            q: `'${parent}' in parents AND name='${name}'`,
        });
        return { exist: data != null ? true : false, data };
    }

    private async list(id: string) {
        const auth = await this.authorize(this._indexAuth);
        try {
            const { data } = await drive.files.list({
                auth,
                q: `'${id}' in parents`,
            });
            this.log(data);
            return data;
        } catch (e: any) {
            if (e.code == 404) return [];
        }
    }

    async getFilesAndFolders(parentId?: string) {
        if (parentId == null || parentId == "") {
            parentId = await this.getRootDir();
        }
        return this.list(parentId);
    }

    async createFolder(folderName: string, parentId?: string) {
        if (folderName == null || folderName == "") throw "Invalid folder name";
        if (parentId == null || parentId == "") {
            parentId = await this.getRootDir();
        }
        const resp = await this.checkIfObjectExist(parentId, folderName);
        if (!resp.exist) {
            const { data } = await drive.files.create({
                auth: await this.authorize(this._indexAuth),
                requestBody: {
                    name: folderName,
                    mimeType: MIME_TYPE_DIRECTORY,
                    parents: [parentId],
                },
            });
            this.log(`Folder created: ${folderName} at id:${parentId}`);
            return data;
        } else {
            throw "Folder already exist";
        }
    }

    private setPermission(auth: any, fileId: string, email: string) {
        return drive.permissions.create({
            auth,
            requestBody: {
                type: "users",
                role: "reader",
                emailAddress: email,
            },
            fileId,
            fields: "*",
        });
    }

    private upload(config: any) {
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

    private validate(config: FileConfig) {
        if (config.name == null || config.name == "") {
            throw "File name is required.";
        }
        if (config.size == null) {
            throw "File size is required.";
        }
    }

    async uploadFile(filestream: Buffer, config: FileConfig) {
        this.validate(config);
        const parent = config.parentId || (await this.getRootDir());
        const email = this._indexAuth.client_email;
        for (const serviceAccountName of Object.keys(this._keyFile)) {
            if (email.startsWith(serviceAccountName)) continue;
            const serviceAccountAuth = this._keyFile[serviceAccountName];
            const info = await this.getStorageInfo(serviceAccountAuth);
            const freeSpace = info.limit - info.usage;
            if (freeSpace >= config.size) {
                this.log(
                    `Uploading [${serviceAccountName}][free space: ${freeSpace}]`
                );
                const auth = await this.authorize(serviceAccountAuth);
                const response = await this.upload({
                    auth,
                    file: filestream,
                    parent,
                    name: config.name,
                    progress: config.progress,
                });
                if (response.data != null && response.data.id != null) {
                    const fileid = response.data.id;
                    this.setPermission(auth, fileid, email);
                    const description = JSON.stringify(response.data);
                    this.createShortcut(
                        config.name,
                        fileid,
                        parent,
                        description
                    );
                }
            }
        }
    }

    private async createShortcut(
        name: string,
        fileid: string,
        parent: string,
        description: string
    ) {
        const shortcutMetadata = {
            auth: await this.authorize(this._indexAuth),
            name,
            mimeType: MIME_TYPE_LINK,
            description,
            shortcutDetails: {
                targetId: fileid,
            },
            parent: [parent],
        };
        return drive.files.create(shortcutMetadata);
    }
}

export default GDriveFS;
