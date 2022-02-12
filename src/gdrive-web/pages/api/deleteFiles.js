import Cookies from "cookies";
import getGFS from "../../lib/Gdrive";

export default async function deleteFiles(req, res) {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));
    for (const path of req.body.files) {
        const resp = await gfs.checkIfEntityExist(path, true);
        if (resp.isDirectory) await gfs.deleteDirectory(path, true);
        else await gfs.deleteFile(path);
    }
    res.status(200).json({ message: "done" });
}
