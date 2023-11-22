import getGFS from "@/lib/gdrive";
import { getToken } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function listFiles(req: NextApiRequest, res: NextApiResponse) {
    const gfs = await getGFS(getToken(req, res));
    const srcId = req.body.sourceIds;
    if (srcId && srcId.length > 0) {
        const destId = req.body.destinationId || "root";
        for (const id of srcId) {
            console.log("moving:", id, "->", destId);
            await gfs.move(id, destId);
        }
        return res.status(200).json({ message: "Items moved" });
    }
    return res.status(400);
}
