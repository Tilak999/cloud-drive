import { google } from "googleapis";
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

    async getOrCreateRootDirectory() {
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

    getFilesAndFolders(parentId?: string) {
        if (parentId == null || parentId == "") parentId = this._rootDirectory;
        return this.list(parentId);
    }

    createFolder(folderName: string, parentId?: string) {
        if(parentId == null || parentId == "") parentId = this._rootDirectory;
        if(folderName == null || folderName == "") throw "Invalid folder name";
        const { data } = await drive.files.create({
            auth,
            requestBody: {
                name: folderName,
                mimeType: MIME_TYPE_DIRECTORY,
                parents: [parentId],
            },
        });
        this.log(`Folder created: ${folderName} at id:${parentId}`)
        return data;
    }

    private validate(config: FileConfig) {
        if(config.name == null || config.name == ""){
            throw "File name is required."
        }
        if(config.size == null || config.size == ""){
            throw "File size is required."
        }
    }

    uploadFile(filestream: Stream, config: FileConfig) {
        validate(config)
        const parent = config.parentId || this._rootDirectory;
        for (const serviceAccountName of Object.keys(this._keyFile)) {
            if (this._indexAuth.client_email.startsWith(serviceAccountName)) {
                continue;
            }
            const serviceAccountAuth = this._keyFile[serviceAccountName];
            const info = await this.getStorageInfo(serviceAccountAuth);
            const freeSpace = info.limit - info.usage;
            if (freeSpace >= config.filesize) {
                this.log(`Uploading to ${serviceAccountName} [free space: ${freeSpace}]`);
                const { data } = await drive.files.create(
                    {
                        auth: await this.authorize(serviceAccountAuth),
                        fields: '*',
                        media: { body: filestream },
                        requestBody: {
                            name: `${parent}/${config.name}`
                        },
                    },
                    {
                        onUploadProgress: config.progress],
                    }
                );

                if (data == null || data.id == null) {
                    throw `File [${config.name}] upload failed`;
                } else {
                    // create permission
                    await drive.permission.create({
                        resource:  {
                            type: 'user',
                            role: 'reader',
                            emailAddress: this._indexAuth.client_email
                          }, 
                          fileId: data.id,
                          fields: '*'
                    })
                     // Create symbolic file in metadata directory
                     const resource = {
                        name: config.filename,
                        mimeType: MIME_TYPE_LINK,
                        description: JSON.stringify({
                            serviceAccountName,
                            mimeType: data.mimeType,
                            fileSize: data.size,
                            webViewLink: data.webViewLink,
                        }),
                        shortcutDetails: { targetId: data.id },
                        parents: [parent]
                    };
                    const symlinkResp = await drive.files.create({
                        auth: await this.authorize(this._indexAuth),
                        requestBody: resource,
                        fields,
                    });
                    return {
                        status: Messages.OK,
                        data: normaliseFileData(symlinkResp.data),
                    };
                }
            }
        }
    }
}

export default GDriveFS;
