import getGFS from "@lib/gdrive";
import { getToken } from "@lib/utils";

export default async function storageInfo(req, res) {
    const gfs = await getGFS(getToken(req, res));
    const data = await gfs.getStorageInfo();
    res.status(200).json(data);
}
