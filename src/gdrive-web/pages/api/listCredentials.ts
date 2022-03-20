import db from "@lib/db";

export default async function listCreds(req, res) {
    const query = await db.query(`Select * From users`);
    res.send(query.rows);
}
