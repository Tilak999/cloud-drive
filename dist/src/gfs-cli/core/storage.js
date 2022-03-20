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
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../../lib/utils");
const ora = require("ora");
module.exports = function (gfs, list, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = ora("Fetching..").start();
        const resp = yield gfs.getStorageInfo();
        spinner.stop();
        console.log("> Total Storage:", utils.humanFileSize(resp.limit));
        console.log("> Usage:", utils.humanFileSize(resp.usage));
        console.log("> Free:", utils.humanFileSize(resp.limit - resp.usage));
    });
};
