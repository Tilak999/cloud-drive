import prisma from "@/lib/prisma";
import { calcHash, getToken } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function updateAccount(req: NextApiRequest, res: NextApiResponse) {
    const { email, current, newpassword, key } = req.body;
    const uuid = getToken(req, res);

    if (newpassword && !current) {
        return res.status(400).send("Current password is required");
    } else if (newpassword && current) {
        const passwordHash = calcHash(current);
        const user = await prisma.users.findFirst({
            where: {
                uuid,
                password: passwordHash,
            },
        });
        if (user) {
            const newPassword = calcHash(newpassword);
            await prisma.users.update({
                data: { password: newPassword },
                where: { uuid },
            });
        } else {
            return res.status(400).send("Invalid current password, please check and retry.");
        }
    }

    if (email) {
        await prisma.users.update({
            data: { email },
            where: { uuid },
        });
    }

    if (key) {
        try {
            JSON.parse(key.text);
            await prisma.users.update({
                data: { key: key.text },
                where: { uuid },
            });
        } catch (e) {
            return res.status(400).send("Invalid key file");
        }
    }

    res.send({
        message: "Account information updated",
    });
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "40mb",
        },
    },
};
