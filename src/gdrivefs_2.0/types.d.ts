export interface FileConfig {
    name: string;
    size: number;
    progress?: (progressEvent: any) => void;
    parentId?: string;
}
