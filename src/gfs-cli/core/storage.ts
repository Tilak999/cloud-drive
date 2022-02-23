import GdriveFS from "../../gdrive-fs";

const utils = require("../../lib/utils");
const ora = require("ora");

module.exports = async function (gfs: GdriveFS, list: string, debug: boolean) {
    const spinner = ora("Fetching..").start();
    const resp = await gfs.getStorageInfo();
    spinner.stop();

    console.log("> Total Storage:", utils.humanFileSize(resp.limit));
    console.log("> Usage:", utils.humanFileSize(resp.usage));
    console.log("> Free:", utils.humanFileSize(resp.limit - resp.usage));
};
