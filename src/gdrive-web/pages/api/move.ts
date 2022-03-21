import Cookies from "cookies";
import getGFS from "@lib/gdrive";

export default async function listFiles(req, res) {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));
    if (req.body.sourceIds && req.body.sourceIds.length > 0) {
        const sourceIds = req.body.sourceIds;
        const destId = req.body.destinationId || null;
        for (const srcId of sourceIds) {
            console.log("moving:", srcId, "->", destId);
            await gfs.move(srcId, destId);
        }
        return res.status(200).json({ message: "items moved" });
    }
    return res.status(400);
}
