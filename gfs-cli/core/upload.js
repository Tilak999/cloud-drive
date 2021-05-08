const GdriveFS = require("../../gdrive-fs");
const utils = require("../../lib/utils");
const ora = require("ora");
const fs = require("fs");
const path = require("path");

const spinner = ora("Calculating ..");

async function uploadDirectory(gfs, source, destination, debug) {
    debug && console.log("uploading dir:", source);
    spinner.start("Uploading: " + source);
    const dirName = path.basename(source);
    const resp = await gfs.createDirectory(destination, dirName);

    if (resp.status == GdriveFS.OK) {
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
        entities.forEach(async (entity) => {
            if (entity.isDirectory)
                await uploadDirectory(
                    gfs,
                    entity.source,
                    entity.destination,
                    debug
                );
            else
                await uploadFile(gfs, entity.source, entity.destination, debug);
        });
    } else {
        spinner.fail(`Error: ` + resp.status.replace("entity", "Directory"));
    }
}

async function uploadFile(gfs, source, destination, debug) {
    debug && console.log("uploading file:", source);
    const filename = path.basename(source);
    const stat = fs.statSync(source);

    spinner.start("[Uploading]" + filename);
    const resp = await gfs.uploadFile(
        destination,
        fs.createReadStream(source),
        {
            filename: filename,
            filesize: stat.size,
            onUploadProgress: (e) => {
                const uploaded = parseInt(e.bytesRead.toString());
                const percentage = ((uploaded / stat.size) * 100).toFixed(2);
                spinner.text = `[Progress: ${percentage}%] ${filename}`;
            },
        }
    );

    spinner.stopAndPersist({
        text: `File uploaded: ${source} to ${path.join(destination, filename)}`,
        symbol: "✔ ",
    });
}

module.exports = async function (gfs, source, destination, debug) {
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
        if (fs.lstatSync(source).isDirectory()) {
            await uploadDirectory(gfs, source, destination, debug);
        } else {
            await uploadFile(gfs, source, destination, debug);
        }
    } catch (e) {
        spinner.stop();
        console.error("error:", e);
    }
};
