import Cookies from "cookies";
import getGFS from "@lib/gdrive";

export default async function deleteObjects(req, res) {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));
    for (const id of req.body.ids) {
        await gfs.deleteObject(id);
    }
    res.status(200).json({ message: "done" });
}
