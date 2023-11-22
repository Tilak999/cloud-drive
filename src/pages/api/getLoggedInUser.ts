import db from "@/lib/db";
import { getToken } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getLoggedInUser(req: NextApiRequest, res: NextApiResponse) {
    const uuid = getToken(req, res);
    let query = await db.query(`Select * From users Where uuid=$1`, [uuid]);
    if (query.rowCount > 0) {
        return res.status(200).send({
            email: query.rows[0].email,
        });
    }
    res.status(401).send("no logged in user");
}
