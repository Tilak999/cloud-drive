import prisma from "@/lib/prisma";
import { getToken } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getLoggedInUser(req: NextApiRequest, res: NextApiResponse) {
    const uuid = getToken(req, res);
    const user = await prisma.users.findFirst({ where: { uuid } });
    if (user) {
        return res.status(200).send({
            email: user.email,
        });
    }
    res.status(401).send("no logged in user");
}
