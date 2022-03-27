import Cookies from "cookies";
import getGFS from "@lib/gdrive";

export default async function cleanup(req, res) {
    const cookie = new Cookies(req, res);
    //const gfs = await getGFS(cookie.get("token"));
    //await gfs.cleanup();
    res.status(200).json({ status: "done" });
}
