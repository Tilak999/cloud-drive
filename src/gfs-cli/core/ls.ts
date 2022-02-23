import GdriveFS, { Messages } from "../../gdrive-fs";
import utils from "../../lib/utils";
import ora from "ora";

module.exports = async function (
    gfs: GdriveFS,
    source: string,
    option: any,
    debug: boolean
) {
    debug && console.log(">>", "Fetching files for path ", source);

    if (!utils.isValidGfsPath(source))
        return console.error(
            "error: Invalid source path, must start with gfs:/"
        );

    if (option.weblink) {
        const spinner = ora("Fetching..").start();
        const { status, files } = await gfs.list(source);
        if (status == Messages.OK && files)
            return spinner.succeed(files[0]["webViewLink"]);
        else return spinner.fail(`Invalid file path.`);
    }

    const spinner = ora("Fetching..").start();
    const { status, files } = await gfs.list(source);
    spinner.stop();

    const table = utils.table(["Name", "Type", "Size", "Last Modified"]);

    if (status == Messages.OK && files) {
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
    } else if (status == Messages.NOT_FOUND) {
        console.log("Directory is Empty");
    } else {
        console.log("error:", status);
    }
};
