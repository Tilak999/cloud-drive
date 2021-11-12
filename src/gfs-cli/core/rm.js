const GdriveFS = require("../../gdrive-fs");
const utils = require("../../lib/utils");
const ora = require("ora");

module.exports = async function (gfs, path, option, debug) {
    debug && console.log(">>", "Removing file/directory ", path);

    if (!utils.isValidGfsPath(path))
        return console.error(
            "error: Invalid source path, must start with gfs:/"
        );

    const spinner = ora("Deleting..").start();
    const resp = await gfs.list(path);

    if (resp.status == GdriveFS.OK && resp.files.length > 0) {
        if (!option.recursive && resp.files[0].isDirectory) {
            return spinner.info(
                "Provided path is a directory, pass -r or --recursive to delete."
            );
        }
        if (resp.files[0].isDirectory) {
            try { await gfs.deleteDirectory(path, true); }
            catch(e) { return spinner.fail("error: " + e)}
            spinner.succeed("Directory deleted: " + path);
        } else {
            try { await gfs.deleteFile(path); }
            catch(e) { return spinner.fail("error: " + e)}
            spinner.succeed("File deleted: " + path);
        }
    } else {
        spinner.stop();
        console.log("Provided path is invalid.");
    }
};
