export interface FileConfig {
    name: string;
    size: number;
    progress?: () => {};
    parentId: string;
}
