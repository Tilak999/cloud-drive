import db from "../../lib/db";
import { calcHash } from "../../lib/utils";
import Cookies from "cookies";

export default async function createMasterKey(req, res) {
    const { email, password, key } = req.body;
    if (!email || !password || !key || !key.contents) return res.status(400).send("bad request");

    let query = await db.query(`Select * From users Where email=$1`, [email]);
    if (query.rowCount != 0) return res.status(400).send("User already created.");

    const passwordHash = calcHash(password);
    const uuid = calcHash(email + password + Math.random());
    const keyJson = key.contents;

    query = await db.query(
        `insert into users (uuid, email, password, key) VALUES($1, $2, $3, $4)`,
        [uuid, email, passwordHash, keyJson]
    );
    const cookies = new Cookies(req, res);
    cookies.set("token", uuid);
    res.send(query.rows);
}
