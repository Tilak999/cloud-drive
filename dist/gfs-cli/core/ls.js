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
module.exports = function (gfs, source, option, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        debug && console.log(">>", "Fetching files for path ", source);
        if (!utils_1.default.isValidGfsPath(source))
            return console.error("error: Invalid source path, must start with gfs:/");
        if (option.weblink) {
            const spinner = (0, ora_1.default)("Fetching..").start();
            const { status, files } = yield gfs.list(source);
            if (status == gdrive_fs_1.Messages.OK && files)
                return spinner.succeed(files[0]["webViewLink"]);
            else
                return spinner.fail(`Invalid file path.`);
        }
        const spinner = (0, ora_1.default)("Fetching..").start();
        const { status, files } = yield gfs.list(source);
        spinner.stop();
        const table = utils_1.default.table(["Name", "Type", "Size", "Last Modified"]);
        if (status == gdrive_fs_1.Messages.OK && files) {
            files.forEach((file) => table.push([
                file.name,
                file.isDirectory ? "Folder" : "File",
                file.isDirectory ? "-" : utils_1.default.humanFileSize(file.fileSize),
                new Date(file.modifiedTime).toLocaleString(),
            ]));
            console.log(table.toString());
            console.log(" Total Files: ", files.length, "\n");
        }
        else if (status == gdrive_fs_1.Messages.NOT_FOUND) {
            console.log("Directory is Empty");
        }
        else {
            console.log("error:", status);
        }
    });
};
