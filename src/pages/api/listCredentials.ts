import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function listCreds(req: NextApiRequest, res: NextApiResponse) {
    const users = await prisma.users.findMany();
    res.send(users);
}
