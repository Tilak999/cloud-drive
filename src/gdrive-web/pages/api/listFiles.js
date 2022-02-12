import Cookies from "cookies";
import GdriveFS from "../../../gdrive-fs";
import getGFS from "../../lib/Gdrive";

export default async function listFiles(req, res) {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));
    const result = await gfs.list(req.body?.path || "gfs:/", true);

    const files = result.files || [];

    const response = {
        files: [
            ...files.filter((f) => f.mimeType.endsWith("folder")),
            ...files.filter((f) => !f.mimeType.endsWith("folder")),
        ],
    };

    res.status(200).json(response);
}
