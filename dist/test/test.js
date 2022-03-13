"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gdriveFS_1 = __importDefault(require("../gdriveFS"));
// id:1ADPskv4IVuCMpyBZtotryb_mGT1QAWHO
const drive = new gdriveFS_1.default({
    masterKeyFile: require("../../masterKey.json"),
    enableDebugLogs: true,
});
drive.shareDrive(`trollvia.official@gmail.com`);
