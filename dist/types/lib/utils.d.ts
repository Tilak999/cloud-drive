import cliTable from "cli-table";
export declare const isValidGfsPath: (path: string) => boolean | "";
export declare function table(head: string[] | undefined): cliTable;
export declare function humanFileSize(size: number): string;
export declare function validateEmail(email: string): RegExpMatchArray | null;
export declare function calcHash(somestring: string): string;
declare const _default: {
    isValidGfsPath: (path: string) => boolean | "";
    calcHash: typeof calcHash;
    validateEmail: typeof validateEmail;
    humanFileSize: typeof humanFileSize;
    table: typeof table;
};
export default _default;
//# sourceMappingURL=utils.d.ts.map