import db from "@lib/db";
import Cookies from "cookies";
import { calcHash } from "@lib/utils";

export default async function signin(req, res) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("bad request");

    const passwordHash = calcHash(password);
    let query = await db.query(
        `Select * From users Where email=$1 and password=$2`,
        [email, passwordHash]
    );
    if (query.rowCount > 0) {
        const cookies = new Cookies(req, res);
        cookies.set("token", query.rows[0].uuid);
        return res.status(200).send(query.rows[0]);
    }
    return res.status(401).send("Authentication failed");
}
