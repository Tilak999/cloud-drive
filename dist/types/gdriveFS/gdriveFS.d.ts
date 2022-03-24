/// <reference types="node" />
import { drive_v3 } from "googleapis";
import { Stream } from "stream";
import { FileConfig } from "./types";
declare class GDriveFS {
    private _keyFile;
    private _indexAuth;
    private _enableDebugLogs;
    private _rootDirectory;
    constructor({ masterKeyFile, enableDebugLogs }: any);
    getRootDir(): Promise<string>;
    private log;
    authorize(key: object): Promise<import("google-auth-library").Compute | import("google-auth-library").JWT | import("google-auth-library").UserRefreshClient | import("google-auth-library").Impersonated | import("google-auth-library").BaseExternalAccountClient>;
    private getOrCreateRootDirectory;
    checkIfObjectExist(parent: string, name: string): Promise<{
        exist: boolean;
        data: drive_v3.Schema$File;
    } | {
        exist: boolean;
        data?: undefined;
    }>;
    private getObject;
    private list;
    getFilesAndFolders(parentId?: string): Promise<drive_v3.Schema$File[]>;
    createFolder(folderName: string, parentId?: string): Promise<drive_v3.Schema$File>;
    private setPermission;
    private removePermission;
    private upload;
    getStorageInfo(serviceAuth?: any): Promise<{
        limit: number;
        usage: number;
        usageInDrive: number;
    }>;
    private validate;
    uploadFile(filestream: Stream, config: FileConfig): Promise<drive_v3.Schema$File>;
    private createShortcut;
    deleteFile(id: string, fileData?: drive_v3.Schema$File): Promise<void>;
    deleteObject(id: string): Promise<any>;
    move(sourceId: string, destinationId: string): Promise<drive_v3.Schema$File>;
    rename(id: string, name: string): Promise<drive_v3.Schema$File>;
    download(fileId: string): Promise<{
        name: string | null | undefined;
        length: number;
        data: import("stream").Readable;
    } | undefined>;
    shareDrive(email: string, revoke?: boolean): Promise<void>;
    cleanup(): Promise<void>;
}
export default GDriveFS;
//# sourceMappingURL=gdriveFS.d.ts.map