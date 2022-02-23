import GdriveFS, { Messages } from "../../gdrive-fs";
import utils from "../../lib/utils";
import ora from "ora";
import fs from "fs";
import path from "path";

const spinner = ora("Calculating ..");

async function uploadDirectory(
    gfs: GdriveFS,
    source: string,
    destination: string,
    debug: boolean
) {
    debug && console.log("uploading dir:", source);
    spinner.start("Uploading: " + source);
    const dirName = path.basename(source);
    const resp = await gfs.createDirectory(destination, dirName);

    if (resp.status == Messages.OK) {
        const entities = fs.readdirSync(source).map((name) => {
            const filesource = path.join(source, name);
            const filedestination = path.join(destination, dirName);
            const isDirectory = fs.lstatSync(filesource).isDirectory();
            return {
                source: filesource,
                destination: filedestination,
                isDirectory,
            };
        });

        for (const entity of entities) {
            if (entity.isDirectory)
                await uploadDirectory(
                    gfs,
                    entity.source,
                    entity.destination,
                    debug
                );
            else
                await uploadFile(gfs, entity.source, entity.destination, debug);
        }
    } else {
        spinner.fail(`Error: ` + resp.status.replace("entity", "Directory"));
    }
}

async function uploadFile(
    gfs: GdriveFS,
    source: string,
    destination: string,
    debug: boolean
) {
    debug && console.log("uploading file:", source);
    const filename = path.basename(source);
    const stat = fs.statSync(source);

    spinner.start("[Uploading] " + filename);
    await gfs.uploadFile(destination, fs.createReadStream(source), {
        filename: filename,
        filesize: stat.size,
        onUploadProgress: (e) => {
            const uploaded = parseInt(e.bytesRead.toString());
            const percentage = ((uploaded / stat.size) * 100).toFixed(2);
            spinner.text = `[Progress: ${percentage}%] ${filename}`;
            if (uploaded == stat.size) {
                spinner.stopAndPersist({ symbol: "✔ " });
            }
        },
    });
}

module.exports = async function (
    gfs: GdriveFS,
    source: string,
    destination: string,
    debug: boolean
) {
    debug && console.log(">>", "Uploading files/directory.. ", destination);

    if (!utils.isValidGfsPath(destination))
        return console.error(
            "error: Invalid destination path, must start with gfs:/"
        );

    source = path.resolve(source);
    if (!fs.existsSync(source)) {
        const message =
            "File/Directory doesn't exist, check provided source path:";
        return console.log("error:", message, source);
    }

    spinner.start();
    try {
        if (fs.statSync(source).isDirectory()) {
            await uploadDirectory(gfs, source, destination, debug);
        } else {
            await uploadFile(gfs, source, destination, debug);
        }
    } catch (e) {
        spinner.stop();
        console.error("error:", e);
    }
};
