import db from "@lib/db";
import { calcHash, getToken } from "@lib/utils";

export default async function updateAccount(req, res) {
    const { email, current, newpassword, key } = req.body;
    const uuid = getToken(req, res);

    if (newpassword && !current) {
        return res.status(400).send("Current password is required");
    } else if (newpassword && current) {
        const passwordHash = calcHash(current);
        const { rowCount, rows } = await db.query(
            `Select * From users Where uuid=$1 AND password=$2`,
            [uuid, passwordHash]
        );
        if (rowCount > 0) {
            const query = `Update users SET password=$1 WHERE uuid=$2`;
            const result = await db.query(query, [calcHash(newpassword), uuid]);
        } else {
            return res.status(400).send("Invalid current password, please check and retry.");
        }
    }

    if (email) {
        const query = `Update users SET email=$1 WHERE uuid=$2`;
        const result = await db.query(query, [email, uuid]);
    }

    if (key) {
        try {
            JSON.parse(key.text);
            const query = `Update users SET key=$1 WHERE uuid=$2`;
            const result = await db.query(query, [key.text, uuid]);
        } catch (e) {
            return res.status(400).send("Invalid key file");
        }
    }

    res.send({
        message: "Account information updated",
    });
}
