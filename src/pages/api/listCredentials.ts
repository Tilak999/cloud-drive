import db from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function listCreds(req: NextApiRequest, res: NextApiResponse) {
    const query = await db.query(`Select * From users`);
    res.send(query.rows);
}
