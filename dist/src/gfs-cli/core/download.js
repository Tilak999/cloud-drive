"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gdrive_fs_1 = require("../../gdrive-fs");
const utils_1 = __importDefault(require("../../lib/utils"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ora_1 = __importDefault(require("ora"));
const spinner = (0, ora_1.default)("Fetching file(s)..");
function downloadDirectory(gfs, source, destination, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        debug && console.log("> Iterating dir.. ", source);
        fs_1.default.mkdirSync(destination);
        const result = yield gfs.list(source);
        if (result.status == gdrive_fs_1.Messages.OK && result.files) {
            result.files.forEach((file) => __awaiter(this, void 0, void 0, function* () {
                if (file.isDirectory) {
                    spinner.stopAndPersist({
                        text: "Creating directory: " + destination,
                        symbol: "✔ ",
                    });
                    const destDir = path_1.default.join(destination, file.name);
                    const sourceDir = path_1.default.join(source, file.name);
                    yield downloadDirectory(gfs, sourceDir, destDir, debug);
                }
                else {
                    yield downloadFile(gfs, file.path, destination, debug);
                }
            }));
        }
    });
}
function downloadFile(gfs, source, destination, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        debug && console.log("> Downloading file.. ", source);
        const filename = path_1.default.basename(source);
        const filepath = path_1.default.join(destination, filename);
        spinner.start(`[Downloading] ${filename}`);
        const result = yield gfs.downloadFile(source);
        if (result.data) {
            const stream = fs_1.default.createWriteStream(filepath);
            let receivedLength = 0;
            result.data.on("data", (chunk) => {
                stream.write(chunk);
                receivedLength += chunk.length;
                const percentage = ((receivedLength / result.length) * 100).toFixed(2);
                spinner.text = `[Progress ${percentage}%] ${filename}`;
            });
            result.data.on("end", () => {
                spinner.stopAndPersist({ symbol: "✔ " });
                stream.end();
            });
        }
        else {
            spinner.stop();
            console.error("Failed to read download stream");
        }
    });
}
module.exports = function (gfs, source, destination, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!utils_1.default.isValidGfsPath(source))
            return console.error("error: Invalid source path, must start with gfs:/");
        destination = path_1.default.resolve(destination);
        if (!fs_1.default.statSync(destination).isDirectory())
            return console.error("error: Destination should be valid local directory path.");
        spinner.start();
        const resp = yield gfs.list(source);
        const files = resp.files || [];
        if (resp.status == gdrive_fs_1.Messages.OK && files.length > 0) {
            if (files[0].isDirectory) {
                debug && console.log(">> directory download..");
                destination = path_1.default.join(destination, files[0].name);
                yield downloadDirectory(gfs, source, destination, debug);
                //spinner.succeed("Download completed");
            }
            else {
                debug && console.log(">> File download..");
                yield downloadFile(gfs, source, destination, debug);
                //spinner.succeed("Download completed");
            }
        }
        else {
            spinner.stop();
            console.error("Invalid gfs: file path in <source>");
        }
    });
};
