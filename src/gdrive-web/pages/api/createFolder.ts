import Cookies from "cookies";
import getGFS from "@lib/gdrive";

export default async function createDirectory(req, res) {
    const cookie = new Cookies(req, res);

    const gfs = await getGFS(cookie.get("token"));
    const data = await gfs.createFolder(
        req.body?.directoryName,
        req.body?.directoryId
    );
    res.status(200).json(data);
}
