const GdriveFS = require("../../gdrive-fs");
const utils = require("../../lib/utils");
const ora = require("ora");

module.exports = async function (gfs, path, forceDelete, debug) {
    debug && console.log(">>", "Removing file/directory ", path);

    if (!utils.isValidGfsPath(path))
        return console.error(
            "error: Invalid source path, must start with gfs:/"
        );

    const spinner = ora("Deleting..").start();
    const resp = await gfs.list(path);

    if (resp.status == GdriveFS.OK && resp.files.length > 0) {
        if (forceDelete != "true" && resp.files[0].isDirectory) {
            return spinner.info(
                "Provided path is a directory, use forceDelete = true"
            );
        }
        if (resp.files[0].isDirectory) {
            await gfs.deleteDirectory(path, true);
            spinner.succeed("Directory deleted: " + path);
        } else {
            await gfs.deleteFile(path);
            spinner.succeed("File deleted: " + path);
        }
    } else {
        spinner.stop();
        console.log("Provided path is invalid.");
    }
};
