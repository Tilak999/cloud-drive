import GDriveFS from "../gdrivefs_2.0";

// id:1ADPskv4IVuCMpyBZtotryb_mGT1QAWHO
const drive = new GDriveFS({
    masterKeyFile: require("../../masterKey.json"),
    enableDebugLogs: true,
});

drive.getFilesAndFolders();
