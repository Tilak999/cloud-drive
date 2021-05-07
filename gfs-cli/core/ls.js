const GdriveFS = require("../../gdrive-fs");
const utils = require("../../lib/utils");
const ora = require("ora");

module.exports = async function (gfs, source, debug) {
    debug && console.log(">>", "Fetching files for path ", source);

    if (!utils.isValidGfsPath(source))
        return console.error(
            "error: Invalid source path, must start with gfs:/"
        );

    const spinner = ora("Fetching..").start();
    const { status, files } = await gfs.list(source, true);
    spinner.stop();

    const table = utils.table(["Name", "Type", "Size", "Last Modified"]);

    if (status == GdriveFS.OK) {
        files.forEach((file) =>
            table.push([
                file.name,
                file.isDirectory ? "Folder" : "File",
                file.isDirectory ? "-" : utils.humanFileSize(file.fileSize),
                new Date(file.modifiedTime).toLocaleString(),
            ])
        );
        console.log(table.toString());
        console.log(" Total Files: ", files.length, "\n");
    } else {
        console.log("error:", status);
    }
};
