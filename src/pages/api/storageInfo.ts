import getGFS from "@/lib/gdrive";
import { getToken } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function storageInfo(req: NextApiRequest, res: NextApiResponse) {
    const gfs = await getGFS(getToken(req, res));
    const data = await gfs.getStorageInfo();
    res.status(200).json(data);
}
