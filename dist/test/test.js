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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyREFBbUM7QUFHbkMsdUNBQXVDO0FBQ3ZDLE1BQU0sS0FBSyxHQUFHLElBQUksa0JBQVEsQ0FBQztJQUN2QixhQUFhLEVBQUUsT0FBTyxDQUFDLHNCQUFzQixDQUFDO0lBQzlDLGVBQWUsRUFBRSxJQUFJO0NBQ3hCLENBQUMsQ0FBQztBQUVILEtBQUssQ0FBQyxVQUFVLENBQUMsNkJBQTZCLENBQUMsQ0FBQyJ9