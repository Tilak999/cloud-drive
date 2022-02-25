import GdriveFS from "../gdrive-fs";

const gfs = new GdriveFS({ masterKeyFile: require("../../masterKey.json") });

async function main() {
    //await gfs.createDirectory("gfs:/", "test-dir");
    await gfs.checkIfEntityExist("gfs:/test-dir");
}

main();
