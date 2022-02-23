import GdriveFS, { Messages } from "../../gdrive-fs";
import utils from "../../lib/utils";
import ora from "ora";

module.exports = async function (
    gfs: GdriveFS,
    path: string,
    option: any,
    debug: boolean
) {
    debug && console.log(">>", "Removing file/directory ", path);

    if (!utils.isValidGfsPath(path))
        return console.error(
            "error: Invalid source path, must start with gfs:/"
        );

    const spinner = ora("Deleting..").start();
    const resp = await gfs.list(path);
    const files = resp.files || [];

    if (resp.status == Messages.OK && files.length > 0) {
        if (!option.recursive && files[0].isDirectory) {
            return spinner.info(
                "Provided path is a directory, pass -r or --recursive to delete."
            );
        }
        if (files[0].isDirectory) {
            try {
                await gfs.deleteDirectory(path, true);
            } catch (e) {
                return spinner.fail("error: " + e);
            }
            spinner.succeed("Directory deleted: " + path);
        } else {
            try {
                await gfs.deleteFile(path);
            } catch (e) {
                return spinner.fail("error: " + e);
            }
            spinner.succeed("File deleted: " + path);
        }
    } else {
        spinner.stop();
        console.log("Provided path is invalid.");
    }
};
