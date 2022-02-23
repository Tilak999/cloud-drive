import GdriveFS from "@dist/gdrive-fs";
import db from "@lib/db";

export default async function getGFS(uuid) {
    if (uuid in global) {
        return global[uuid];
    }
    const q = await db.query(`SELECT key FROM users WHERE uuid=$1`, [uuid]);
    if (q.rowCount == 1) {
        global[uuid] = new GdriveFS({
            masterKeyFile: q.rows[0].key,
            enableDebugLogs: process.env.NODE_ENV != "production",
        });
    }
    return global[uuid];
}
