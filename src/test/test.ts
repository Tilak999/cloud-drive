import GDriveFS from "../gdriveFS";
import fs from "fs";

// id:1ADPskv4IVuCMpyBZtotryb_mGT1QAWHO
const drive = new GDriveFS({
    masterKeyFile: require("../../masterKey.json"),
    enableDebugLogs: true,
});

drive.cleanup();
