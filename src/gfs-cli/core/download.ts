import GdriveFS, { Messages } from "../../gdrive-fs";
import utils from "../../lib/utils";
import fs from "fs";
import path from "path";
import ora from "ora";

const spinner = ora("Fetching file(s)..");

async function downloadDirectory(
    gfs: GdriveFS,
    source: string,
    destination: string,
    debug: boolean
) {
    debug && console.log("> Iterating dir.. ", source);
    fs.mkdirSync(destination);
    const result = await gfs.list(source);
    if (result.status == Messages.OK && result.files) {
        result.files.forEach(async (file) => {
            if (file.isDirectory) {
                spinner.stopAndPersist({
                    text: "Creating directory: " + destination,
                    symbol: "✔ ",
                });
                const destDir = path.join(destination, file.name);
                const sourceDir = path.join(source, file.name);
                await downloadDirectory(gfs, sourceDir, destDir, debug);
            } else {
                await downloadFile(gfs, file.path, destination, debug);
            }
        });
    }
}

async function downloadFile(
    gfs: GdriveFS,
    source: string,
    destination: string,
    debug: boolean
) {
    debug && console.log("> Downloading file.. ", source);
    const filename = path.basename(source);
    const filepath = path.join(destination, filename);

    spinner.start(`[Downloading] ${filename}`);
    const result = await gfs.downloadFile(source);

    if (result.data) {
        const stream = fs.createWriteStream(filepath);
        let receivedLength = 0;
        result.data.on("data", (chunk) => {
            stream.write(chunk);
            receivedLength += chunk.length;
            const percentage = ((receivedLength / result.length) * 100).toFixed(
                2
            );
            spinner.text = `[Progress ${percentage}%] ${filename}`;
        });
        result.data.on("end", () => {
            spinner.stopAndPersist({ symbol: "✔ " });
            stream.end();
        });
    } else {
        spinner.stop();
        console.error("Failed to read download stream");
    }
}

module.exports = async function (
    gfs: GdriveFS,
    source: string,
    destination: string,
    debug: boolean
) {
    if (!utils.isValidGfsPath(source))
        return console.error(
            "error: Invalid source path, must start with gfs:/"
        );

    destination = path.resolve(destination);
    if (!fs.statSync(destination).isDirectory())
        return console.error(
            "error: Destination should be valid local directory path."
        );

    spinner.start();
    const resp = await gfs.list(source);
    const files = resp.files || [];
    if (resp.status == Messages.OK && files.length > 0) {
        if (files[0].isDirectory) {
            debug && console.log(">> directory download..");
            destination = path.join(destination, files[0].name);
            await downloadDirectory(gfs, source, destination, debug);
            //spinner.succeed("Download completed");
        } else {
            debug && console.log(">> File download..");
            await downloadFile(gfs, source, destination, debug);
            //spinner.succeed("Download completed");
        }
    } else {
        spinner.stop();
        console.error("Invalid gfs: file path in <source>");
    }
};
