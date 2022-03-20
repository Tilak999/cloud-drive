"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcHash = exports.validateEmail = exports.humanFileSize = exports.table = exports.isValidGfsPath = void 0;
const cli_table_1 = __importDefault(require("cli-table"));
const crypto_1 = __importDefault(require("crypto"));
const isValidGfsPath = (path) => {
    return path && path.startsWith("gfs:/");
};
exports.isValidGfsPath = isValidGfsPath;
function table(head) {
    const chars = {
        top: " ",
        "top-mid": "",
        "top-left": "",
        "top-right": "",
        bottom: " ",
        "bottom-mid": "",
        "bottom-left": "",
        "bottom-right": "",
        left: "",
        "left-mid": "",
        mid: "",
        "mid-mid": "",
        right: "",
        "right-mid": "",
        middle: "\t",
    };
    return new cli_table_1.default({
        head,
        chars,
    });
}
exports.table = table;
function humanFileSize(size) {
    if (size == 0)
        return "0 B";
    let i = Math.floor(Math.log(size) / Math.log(1024));
    const sizeFmt = (size / Math.pow(1024, i)) * 1;
    return (`${sizeFmt.toFixed(2)} ` +
        ["B", "KB", "MB", "GB", "TB"][i]);
}
exports.humanFileSize = humanFileSize;
function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}
exports.validateEmail = validateEmail;
function calcHash(somestring) {
    return crypto_1.default.createHash("md5").update(somestring).digest("hex").toString();
}
exports.calcHash = calcHash;
exports.default = {
    isValidGfsPath: exports.isValidGfsPath,
    calcHash,
    validateEmail,
    humanFileSize,
    table,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDBEQUFpQztBQUNqQyxvREFBNEI7QUFFckIsTUFBTSxjQUFjLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRTtJQUMzQyxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzVDLENBQUMsQ0FBQztBQUZXLFFBQUEsY0FBYyxrQkFFekI7QUFFRixTQUFnQixLQUFLLENBQUMsSUFBMEI7SUFDNUMsTUFBTSxLQUFLLEdBQUc7UUFDVixHQUFHLEVBQUUsR0FBRztRQUNSLFNBQVMsRUFBRSxFQUFFO1FBQ2IsVUFBVSxFQUFFLEVBQUU7UUFDZCxXQUFXLEVBQUUsRUFBRTtRQUNmLE1BQU0sRUFBRSxHQUFHO1FBQ1gsWUFBWSxFQUFFLEVBQUU7UUFDaEIsYUFBYSxFQUFFLEVBQUU7UUFDakIsY0FBYyxFQUFFLEVBQUU7UUFDbEIsSUFBSSxFQUFFLEVBQUU7UUFDUixVQUFVLEVBQUUsRUFBRTtRQUNkLEdBQUcsRUFBRSxFQUFFO1FBQ1AsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsRUFBRTtRQUNULFdBQVcsRUFBRSxFQUFFO1FBQ2YsTUFBTSxFQUFFLElBQUk7S0FDZixDQUFDO0lBQ0YsT0FBTyxJQUFJLG1CQUFRLENBQUM7UUFDaEIsSUFBSTtRQUNKLEtBQUs7S0FDUixDQUFDLENBQUM7QUFDUCxDQUFDO0FBdEJELHNCQXNCQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFZO0lBQ3RDLElBQUksSUFBSSxJQUFJLENBQUM7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUM1QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUc7UUFDNUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQVcsQ0FBQztBQUNwRCxDQUFDO0FBTkQsc0NBTUM7QUFFRCxTQUFnQixhQUFhLENBQUMsS0FBYTtJQUN2QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FDZixXQUFXLEVBQUU7U0FDYixLQUFLLENBQ0YsdUpBQXVKLENBQzFKLENBQUM7QUFDVixDQUFDO0FBTkQsc0NBTUM7QUFFRCxTQUFnQixRQUFRLENBQUMsVUFBa0I7SUFDdkMsT0FBTyxnQkFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2hGLENBQUM7QUFGRCw0QkFFQztBQUVELGtCQUFlO0lBQ1gsY0FBYyxFQUFkLHNCQUFjO0lBQ2QsUUFBUTtJQUNSLGFBQWE7SUFDYixhQUFhO0lBQ2IsS0FBSztDQUNSLENBQUMifQ==