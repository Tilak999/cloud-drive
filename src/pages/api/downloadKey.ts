import prisma from "@/lib/prisma";
import { getToken } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function downloadKey(req: NextApiRequest, res: NextApiResponse) {
    const token = getToken(req, res);
    if (!token || token == "") return res.status(400).send("bad request");

    const user = await prisma.users.findFirst({ where: { uuid: token } });
    if (user) {
        res.setHeader("Content-Length", "");
        res.setHeader("Content-Disposition", `attachment; filename="key.json"`);
        return res.send(JSON.stringify(user.key, null, 2));
    }
    return res.status(401).send("Authentication failed");
}
