import Cookies from "cookies";
import getGFS from "@lib/gdrive";

export default async function listFiles(req, res) {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));
    if (req.body.folderId == "root") {
        console.log("-> Fetching root contents");
        const data = await gfs.getFilesAndFolders();
        res.status(200).json(data);
    } else {
        console.log("-> Fetching contents for: ", req.body.folderId);
        const data = await gfs.getFilesAndFolders(req.body.folderId);
        res.status(200).json(data);
    }
}
