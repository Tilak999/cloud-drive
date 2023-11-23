import prisma from "@/lib/prisma";
import { calcHash } from "@/lib/utils";
import Cookies from "cookies";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "40mb",
        },
        responseLimit: false,
    },
};

export default async function createMasterKey(req: NextApiRequest, res: NextApiResponse) {
    const { email, password, key } = req.body;
    if (!email || !password || !key || !key.contents) return res.status(400).send("bad request");

    const user = await prisma.users.findFirst({ where: { email } });
    if (user) return res.status(400).send("User already exist.");

    const passwordHash = calcHash(password);
    const keyJson = key.contents;

    const newUser = await prisma.users.create({
        data: { email, password: passwordHash, key: keyJson },
    });
    const cookies = new Cookies(req, res);
    cookies.set("token", newUser.uuid);
    res.send("OK");
}
