import GdriveFS, { Messages } from "../../gdrive-fs";
import utils from "../../lib/utils";
import ora from "ora";

module.exports = async function (
    gfs: GdriveFS,
    source: string,
    directoryName: string,
    debug: boolean
) {
    debug && console.log(">>", "Creating directory at path ", source);

    if (!utils.isValidGfsPath(source))
        return console.error(
            "error: Invalid source path, must start with gfs:/"
        );

    const spinner = ora("Creating Directory..").start();
    try {
        const resp = await gfs.createDirectory(source, directoryName);
        spinner.stop();
        if (resp.status == Messages.OK)
            console.log("Success: directory created");
        else
            console.error("error:", resp.status.replace("entity", "directory"));
    } catch (e) {
        spinner.stop();
        console.error("error:", e);
    }
};
