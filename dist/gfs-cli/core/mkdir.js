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
module.exports = function (gfs, source, directoryName, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        debug && console.log(">>", "Creating directory at path ", source);
        if (!utils_1.default.isValidGfsPath(source))
            return console.error("error: Invalid source path, must start with gfs:/");
        const spinner = (0, ora_1.default)("Creating Directory..").start();
        try {
            const resp = yield gfs.createDirectory(source, directoryName);
            spinner.stop();
            if (resp.status == gdrive_fs_1.Messages.OK)
                console.log("Success: directory created");
            else
                console.error("error:", resp.status.replace("entity", "directory"));
        }
        catch (e) {
            spinner.stop();
            console.error("error:", e);
        }
    });
};
