import GdriveFS from "../../gdrive-fs";
import db from "./db";

export default async function getGFS(uuid) {
    if (uuid in global) {
        return global[uuid];
    }
    const q = await db.query(`SELECT key FROM users WHERE uuid=$1`, [uuid]);
    if (q.rowCount == 1) {
        global[uuid] = new GdriveFS({
            masterKeyFile: q.rows[0].key,
            debug: process.env.ENV != "production",
        });
    }
    return global[uuid];
}
