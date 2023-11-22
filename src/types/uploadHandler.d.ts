export interface ICurrentFileProgress {
    loaded?: number;
    total?: number;
    name: string;
    percentage?: number;
    directoryId: string;
}

export interface IUploadFileObject extends ICurrentFileProgress {
    file: File;
}
