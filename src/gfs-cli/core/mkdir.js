const GdriveFS = require("../../gdrive-fs");
const utils = require("../../lib/utils");
const ora = require("ora");

module.exports = async function (gfs, source, directoryName, debug) {
    debug && console.log(">>", "Creating directory at path ", source);

    if (!utils.isValidGfsPath(source))
        return console.error("error: Invalid source path, must start with gfs:/");

    const spinner = ora("Creating Directory..").start();
    try {
        const resp = await gfs.createDirectory(source, directoryName);
        spinner.stop();
        if (resp.status == GdriveFS.OK)
            console.log("Success: directory created");
        else
            console.error("error:", resp.status.replace("entity", "directory"));
    } catch (e) {
        spinner.stop();
        console.error("error:", e);
    }
};
