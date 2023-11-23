import prisma from "@/lib/prisma";
import { calcHash } from "@/lib/utils";
import Cookies from "cookies";
import { NextApiRequest, NextApiResponse } from "next";

export default async function signin(req: NextApiRequest, res: NextApiResponse) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("bad request");

    const passwordHash = calcHash(password);
    let user = await prisma.users.findFirst({
        select: { uuid: true, email: true },
        where: {
            email: email,
            password: passwordHash,
        },
    });
    if (user) {
        const cookies = new Cookies(req, res);
        cookies.set("token", user.uuid, {
            sameSite: true,
        });
        return res.status(200).send(user);
    }
    return res.status(401).send("Authentication failed");
}
