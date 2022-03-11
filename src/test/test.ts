import GDriveFS from "../gdrivefs_2.0";
import fs from "fs";

// id:1ADPskv4IVuCMpyBZtotryb_mGT1QAWHO
const drive = new GDriveFS({
    masterKeyFile: require("../../masterKey.json"),
    enableDebugLogs: true,
});

drive.getStorageInfo().then(console.log);
//drive.getFilesAndFolders().then(console.log);
//drive.createFolder("series").then(console.log);

const source = "C:\\Users\\TSL4\\Documents\\cloud-drive\\README.md";
const stat = fs.statSync(source);
drive.uploadFile(fs.readFileSync(source), {
    name: "readme.md",
    size: stat.size,
    progress: console.log,
});
