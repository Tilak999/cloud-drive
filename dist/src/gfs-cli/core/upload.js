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
const ora_1 = __importDefault(require("ora"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const spinner = (0, ora_1.default)("Calculating ..");
function uploadDirectory(gfs, source, destination, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        debug && console.log("uploading dir:", source);
        spinner.start("Uploading: " + source);
        const dirName = path_1.default.basename(source);
        const resp = yield gfs.createDirectory(destination, dirName);
        if (resp.status == gdrive_fs_1.Messages.OK) {
            const entities = fs_1.default.readdirSync(source).map((name) => {
                const filesource = path_1.default.join(source, name);
                const filedestination = path_1.default.join(destination, dirName);
                const isDirectory = fs_1.default.lstatSync(filesource).isDirectory();
                return {
                    source: filesource,
                    destination: filedestination,
                    isDirectory,
                };
            });
            for (const entity of entities) {
                if (entity.isDirectory)
                    yield uploadDirectory(gfs, entity.source, entity.destination, debug);
                else
                    yield uploadFile(gfs, entity.source, entity.destination, debug);
            }
        }
        else {
            spinner.fail(`Error: ` + resp.status.replace("entity", "Directory"));
        }
    });
}
function uploadFile(gfs, source, destination, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        debug && console.log("uploading file:", source);
        const filename = path_1.default.basename(source);
        const stat = fs_1.default.statSync(source);
        spinner.start("[Uploading] " + filename);
        yield gfs.uploadFile(destination, fs_1.default.createReadStream(source), {
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
    });
}
module.exports = function (gfs, source, destination, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        debug && console.log(">>", "Uploading files/directory.. ", destination);
        if (!utils_1.default.isValidGfsPath(destination))
            return console.error("error: Invalid destination path, must start with gfs:/");
        source = path_1.default.resolve(source);
        if (!fs_1.default.existsSync(source)) {
            const message = "File/Directory doesn't exist, check provided source path:";
            return console.log("error:", message, source);
        }
        spinner.start();
        try {
            if (fs_1.default.statSync(source).isDirectory()) {
                yield uploadDirectory(gfs, source, destination, debug);
            }
            else {
                yield uploadFile(gfs, source, destination, debug);
            }
        }
        catch (e) {
            spinner.stop();
            console.error("error:", e);
        }
    });
};
