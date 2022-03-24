import { drive_v3, google } from "googleapis";
import { file } from "googleapis/build/src/apis/file";
import { Stream } from "stream";
import { FileConfig } from "./types";
const drive = google.drive("v3");

const MIME_TYPE_DIRECTORY = "application/vnd.google-apps.folder";
const MIME_TYPE_LINK = "application/vnd.google-apps.shortcut";
const fields =
    "mimeType, id, name, size, modifiedTime, hasThumbnail, iconLink, originalFilename, description, webViewLink";

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
        if (data && data.files && data.files.length > 0) {
            return { exist: true, data: data.files[0] };
        } else {
            return { exist: false };
        }
    }

    private async getObject(id: string) {
        const auth = await this.authorize(this._indexAuth);
        try {
            const { data } = await drive.files.get({
                fileId: id,
                fields: "*",
                auth,
            });
            return data;
        } catch (e) {
            return null;
        }
    }

    private async list(id: string) {
        const auth = await this.authorize(this._indexAuth);
        try {
            const { data } = await drive.files.list({
                auth,
                fields: "*",
                q: `'${id}' in parents`,
                orderBy: `folder, name, modifiedTime`,
            });
            if (data && data.files) {
                this.log("Number of items fetched:", data.files.length);
                return data.files || [];
            } else {
                return [];
            }
        } catch (e: any) {
            if (e.code == 404) return [];
            else throw e;
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

    private async removePermission(auth: any, fileId: string, email: string) {
        const { data } = await drive.permissions.list({
            auth,
            fileId,
        });
        const permission = data.permissions?.find(
            (permission) => permission.emailAddress == email
        );
        if (permission && permission.id) {
            return drive.permissions.delete({
                auth,
                permissionId: permission.id,
                fileId,
                fields: "*",
            });
        }
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

    private async validate(config: FileConfig) {
        if (config.name == null || config.name == "") {
            throw "File name is required.";
        }
        if (config.size == null) {
            throw "File size is required.";
        }
        if (config.parentId) {
            const { exist } = await this.checkIfObjectExist(
                config.parentId,
                config.name
            );
            if (exist) throw "File with same name already present";
        } else {
            throw "Parent folder id is required.";
        }
    }

    async uploadFile(filestream: Stream, config: FileConfig) {
        config.parentId = config.parentId || (await this.getRootDir());
        const email = this._indexAuth.client_email;
        await this.validate(config);
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
                    parent: config.parentId,
                    name: config.name,
                    progress: config.progress,
                });

                if (response.data != null && response.data.id != null) {
                    const fileid = response.data.id;
                    try {
                        await this.setPermission(auth, fileid, email);
                        const description = JSON.stringify({
                            ...response.data,
                            serviceAccountName,
                        });
                        return this.createShortcut(
                            config.name,
                            fileid,
                            config.parentId,
                            description
                        );
                    } catch (error: any) {
                        await drive.files.delete({
                            auth,
                            fileId: fileid,
                        });
                    }
                } else {
                    throw `File [${config.name}] upload failed`;
                }
            }
        }
        throw "Drive full add additional service account and retry";
    }

    private async createShortcut(
        name: string,
        fileid: string,
        parent: string,
        description: string
    ) {
        const shortcutMetadata = {
            auth: await this.authorize(this._indexAuth),
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
        const resp = await drive.files.create(shortcutMetadata);
        if (resp.data == null) {
            throw "Failed to create shortcut";
        }
        return resp.data;
    }

    async deleteFile(id: string, fileData?: drive_v3.Schema$File) {
        let data: any = fileData;
        if (id && id != "") {
            data = await this.getObject(id);
        }
        if (data && data.id) {
            const targetFile = JSON.parse(data.description || "");
            this.log("Deleting file: " + data.name);
            const cred = this._keyFile[targetFile.serviceAccountName];
            try {
                await drive.files.delete({
                    auth: await this.authorize(cred),
                    fileId: targetFile.id,
                });
            } catch (e: any) {
                if (e.code != 404) throw e;
            }
            await drive.files.delete({
                auth: await this.authorize(this._indexAuth),
                fileId: data.id,
            });
        }
    }

    async deleteObject(id: string): Promise<any> {
        if (!id || id == "") throw `[deleteObject] Invalid id: ${id}`;
        const data = await this.getObject(id);
        if (data && data.id) {
            if (data.mimeType == MIME_TYPE_DIRECTORY) {
                this.log("Deleting folder: " + data.name);
                const files = await this.list(data.id);
                for (const file of files) {
                    if (file.id) {
                        if (file.mimeType == MIME_TYPE_DIRECTORY)
                            await this.deleteObject(file.id);
                        else await this.deleteFile(file.id);
                    }
                }
                return drive.files.delete({
                    auth: await this.authorize(this._indexAuth),
                    fileId: data.id,
                });
            } else {
                return this.deleteFile(data.id);
            }
        } else {
            throw "Object not found";
        }
    }

    async move(sourceId: string, destinationId: string) {
        if (!sourceId || sourceId == "") throw "Invalid sourceId";
        if (!destinationId || destinationId == "") {
            destinationId = await this.getRootDir();
        }
        const src = await this.getObject(sourceId);
        const dest = await this.getObject(destinationId);
        if (src && dest) {
            if (dest.mimeType != MIME_TYPE_DIRECTORY) {
                throw "DestinationId is not a directory.";
            }
            const auth = await this.authorize(this._indexAuth);
            const { data } = await drive.files.update({
                auth,
                removeParents: `${src.parents && src.parents[0]}`,
                addParents: `${destinationId}`,
                fileId: `${src.id}`,
            });
            return data;
        } else {
            throw "Invalid sourceId or destinationId";
        }
    }

    async rename(id: string, name: string) {
        if (!id || id == "") throw "Invalid file/folder id";
        const auth = await this.authorize(this._indexAuth);
        const { data } = await drive.files.update({
            auth,
            fileId: id,
            requestBody: {
                name,
            },
        });
        return data;
    }

    async download(fileId: string) {
        if (fileId && fileId.trim() != "") {
            const fileData = await this.getObject(fileId);
            if (fileData && fileData.mimeType == MIME_TYPE_LINK) {
                const targetFileData = JSON.parse(fileData.description || "");
                const auth = await this.authorize(
                    this._keyFile[targetFileData.serviceAccountName]
                );
                const resp = await drive.files.get(
                    { auth, fileId: targetFileData.id, alt: "media" },
                    { responseType: "stream" }
                );
                return {
                    name: fileData.name,
                    length: parseInt(resp.headers["content-length"]),
                    data: resp.data,
                };
            }
        } else {
            throw "File not found";
        }
    }

    async shareDrive(email: string, revoke?: boolean) {
        const root =
            (await this.getOrCreateRootDirectory()) || this._rootDirectory;
        const auth = await this.authorize(this._indexAuth);
        if (!revoke) this.setPermission(auth, root, email);
        else this.removePermission(auth, this._rootDirectory, email);
    }

    async cleanup() {
        const promises = [];
        const keyNames = Object.keys(this._keyFile) as any[];
        for (const keyName of keyNames) {
            promises.push(
                drive.files.list({
                    auth: await this.authorize(this._keyFile[keyName]),
                    fields: "*",
                })
            );
        }
        const results = await Promise.all(promises);
        const files: any[] = [];
        for (const result of results) {
            if (result.data && result.data.files) {
                for (const result of results) {
                }
                result.data.files.forEach((i) => files.push(i));
            }
        }

        const shortcuts = files.filter(
            (file) => file.mimeType === MIME_TYPE_LINK
        );

        const rawFiles = files.filter(
            (file) =>
                file.mimeType !== MIME_TYPE_LINK &&
                file.mimeType !== MIME_TYPE_DIRECTORY
        );

        const shortcutParentIds = shortcuts.map(
            (file) => file.shortcutDetails.targetId
        );

        const danglingFiles = rawFiles.filter(
            (f) => !shortcutParentIds.includes(f.id)
        );

        danglingFiles.forEach(async (file) => {
            let chunk = file.owners[0].emailAddress.split(".");
            chunk = chunk[0].split("@");
            const accnt = chunk[1] + "-" + chunk[0];
            drive.files
                .delete({
                    auth: await this.authorize(this._keyFile[accnt]),
                    fileId: file.id,
                })
                .then((d) => console.log("deleted:", file.name))
                .catch((e) => console.log("deletion failed:", file.name));
        });
    }
}

export default GDriveFS;
