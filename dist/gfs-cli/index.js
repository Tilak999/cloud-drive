#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gdrive_fs_1 = __importDefault(require("../gdrive-fs"));
const path_1 = __importDefault(require("path"));
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
let debug = false;
let keyFilePath = path_1.default.resolve(process.env.HOME || __dirname, "./.gfs/masterKey.json");
function main() {
    commander_1.program.version("0.0.1");
    commander_1.program.option("-d, --debug", "output extra debugging");
    if (!process.env.GFS_KEY_FILE && !fs_1.default.existsSync(keyFilePath)) {
        return console.error(`Abort: Neither key file at ${keyFilePath} is present nor GFS_KEY_FILE env variable is not set.`);
    }
    else {
        if (process.env.GFS_KEY_FILE) {
            keyFilePath = path_1.default.resolve(process.env.GFS_KEY_FILE);
        }
        debug && console.log("> Key File:", keyFilePath);
    }
    const gfs = new gdrive_fs_1.default({ masterKeyFile: require(keyFilePath) });
    commander_1.program
        .command("ls <source>")
        .description("List all the files at the give path.")
        .option("-w, --weblink", "Get web link for the file")
        .action((source, option) => require("./core/ls")(gfs, source, option, debug));
    commander_1.program
        .command("mkdir <source> <dirName>")
        .description("Create new directory at <source> with provided name.")
        .action((source, dirName) => require("./core/mkdir")(gfs, source, dirName, debug));
    commander_1.program
        .command("upload <source> <destination>")
        .description("Upload file/directory to <source> path.")
        .action((source, destination) => require("./core/upload")(gfs, source, destination, debug));
    commander_1.program
        .command("download <source> <destination>")
        .description("Download file from gfs to local system.")
        .action((source, destination) => require("./core/download")(gfs, source, destination, debug));
    commander_1.program
        .command("rm <path>")
        .description("Remove file/directory from <path>")
        .option("-r, --recursive", "Recursively delete file and directory.")
        .action((path, option) => require("./core/rm")(gfs, path, option, debug));
    commander_1.program
        .command("storage [list]")
        .description("Get storage information.")
        .action((list) => require("./core/storage")(gfs, list, debug));
    debug = ["-d", "--debug"].includes(process.argv[2]);
    commander_1.program.parse(process.argv);
}
main();
