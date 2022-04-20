import db from "@lib/db";
import { getToken } from "@lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function downloadKey(req: NextApiRequest, res: NextApiResponse) {
    const token = getToken(req, res);
    if (!token || token == "") return res.status(400).send("bad request");

    let query = await db.query(`Select * From users Where uuid=$1`, [token]);
    if (query.rowCount > 0) {
        res.setHeader("Content-Length", "");
        res.setHeader("Content-Disposition", `attachment; filename="key.json"`);
        return res.send(JSON.stringify(query.rows[0].key, null, 2));
    }
    return res.status(401).send("Authentication failed");
}
