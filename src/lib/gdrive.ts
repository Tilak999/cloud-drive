import GdriveFS from "@ideabox/cloud-drive-fs";
import prisma from "./prisma";

declare global {
    var session: Map<string, any>;
}

global.session = new Map();

export default async function getGFS(uuid: string) {
    const userSession = global.session.get(uuid);
    if (userSession) {
        return userSession as GdriveFS;
    } else {
        const user = await prisma.users.findFirst({
            select: { key: true },
            where: {
                uuid: uuid,
            },
        });
        if (!user) throw `user with uuid '${uuid}' not found`;
                const drive = new GdriveFS({
            key: JSON.parse(user.key),
            driveName: "gdrive-fs",
            debug: process.env.NODE_ENV != "production",
        });
        global.session.set(uuid, drive);
        return drive as GdriveFS;
    }
}
