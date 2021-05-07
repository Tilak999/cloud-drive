#!/usr/bin/env node

const GdriveFS = require("../gdrive-fs");
const path = require("path");
const { program } = require("commander");
const fs = require("fs");

let debug = false;
let keyFilePath = path.resolve(process.env.HOME, "./.gfs/masterKey.json");

function main() {
    program.version("0.0.1");
    program.option("-d, --debug", "output extra debugging");

    if (!process.env.GFS_KEY_FILE && !fs.existsSync(keyFilePath)) {
        return console.error(
            "Abort: Neither key file at " +
                keyFilePath +
                " is present nor GFS_KEY_FILE env variable is not set."
        );
    } else {
        if (process.env.GFS_KEY_FILE) {
            keyFilePath = path.resolve(process.env.GFS_KEY_FILE);
        }
        debug && console.log("> Key File:", keyFilePath);
    }

    const gfs = new GdriveFS({
        keyFile: require(keyFilePath),
        indexDrive: "svcaccnt-0",
    });

    program
        .command("ls <source>")
        .description("List all the files at the give path.")
        .action((source) => require("./core/ls")(gfs, source, debug));

    program
        .command("mkdir <source> <dirName>")
        .description("Create new directory at <source> with provided name.")
        .action((source, dirName) =>
            require("./core/mkdir")(gfs, source, dirName, debug)
        );

    program
        .command("upload <source> <destination>")
        .description("Upload file/directory to <source> path.")
        .action((source, destination) =>
            require("./core/upload")(gfs, source, destination, debug)
        );

    program
        .command("download <source> <destination>")
        .description("Download file from gfs to local system.")
        .action((source, destination) =>
            require("./core/download")(gfs, source, destination, debug)
        );

    program
        .command("rm <path> [forceDelete]")
        .description("Remove file/directory from <path>")
        .action((path, forceDelete) =>
            require("./core/rm")(gfs, path, forceDelete, debug)
        );

    program
        .command("storage [list]")
        .description("Get storage information.")
        .action((list) => require("./core/storage")(gfs, list, debug));

    debug = ["-d", "--debug"].includes(process.argv[2]);
    program.parse(process.argv);
}

main();
