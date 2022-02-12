import Cookies from "cookies";
import getGFS from "../../lib/Gdrive";

export default async function listFiles(req, res) {
    const cookie = new Cookies(req, res);

    const gfs = await getGFS(cookie.get("token"));
    const data = await gfs.list(req.body?.path || "gfs:/", true);

    res.status(200).json({
        files: [
            ...data.files.filter((f) => f.mimeType.endsWith("folder")),
            ...data.files.filter((f) => f.mimeType.endsWith("symlink")),
        ],
    });
}
