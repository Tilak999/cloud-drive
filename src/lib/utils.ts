import cliTable from "cli-table";
import crypto from "crypto";

export function isValidGfsPath(path: string) {
    return path && path.startsWith("gfs:/");
}

export function table(head: string[] | undefined) {
    const chars = {
        top: " ",
        "top-mid": "",
        "top-left": "",
        "top-right": "",
        bottom: " ",
        "bottom-mid": "",
        "bottom-left": "",
        "bottom-right": "",
        left: "",
        "left-mid": "",
        mid: "",
        "mid-mid": "",
        right: "",
        "right-mid": "",
        middle: "\t",
    };
    return new cliTable({
        head,
        chars,
    });
}

export function humanFileSize(size: number) {
    if (size == 0) return "0 B";
    let i = Math.floor(Math.log(size) / Math.log(1024));
    const sizeFmt = (size / Math.pow(1024, i)) * 1;
    return (`${sizeFmt.toFixed(2)} ` +
        ["B", "KB", "MB", "GB", "TB"][i]) as string;
}

export function validateEmail(email: string) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}

export function calcHash(somestring: string) {
    return crypto.createHash("md5").update(somestring).digest("hex").toString();
}
