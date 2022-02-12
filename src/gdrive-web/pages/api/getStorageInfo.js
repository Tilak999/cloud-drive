import Cookies from "cookies";
import getGFS from "../../lib/Gdrive";

export default async function deleteFiles(req, res) {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));
    const data = await gfs.getStorageInfo();
    res.status(200).json(data);
}
