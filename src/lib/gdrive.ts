// @ts-nocheck
import db from "@/lib/db";
import GdriveFS from "@ideabox/cloud-drive-fs";

export default async function getGFS(uuid: string) {
    if (uuid in global && global[uuid] != null) {
        return global[uuid] as GdriveFS;
    }
    const q = await db.query(`SELECT key FROM users WHERE uuid=$1`, [uuid]);
    if (q.rowCount == 1) {
        global[uuid] = new GdriveFS({
            key: q.rows[0].key,
            driveName: "gdrive-fs",
            debug: process.env.NODE_ENV != "production",
        });
    }
    return global[uuid] as GdriveFS;
}
