import GdriveFS from "../../gdrive-fs";
import fs from "fs";

export default function getGFS(keyFilePath) {
    const keyFile = fs.readFileSync(keyFilePath, "utf-8");
    return new GdriveFS({ masterKeyFile: JSON.parse(keyFile) });
}
