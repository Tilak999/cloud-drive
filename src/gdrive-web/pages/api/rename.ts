import Cookies from "cookies";
import getGFS from "@lib/gdrive";

export default async function createDirectory(req, res) {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));

    if (req.body.id && req.body.id != "" && req.body.name) {
        const id = req.body.id;
        const newName = req.body.name;

        const item = await gfs.getObject(id);
        if (item && item.id != "") {
            const list = await gfs.getFilesAndFolders(item.parents[0].id);
            const matchedItems = list.filter(
                (i) => i.name.toLowerCase() == newName.toLowerCase()
            );
            if (matchedItems.length > 0) {
                return res.status(400).json({
                    errorMsg: "File/Folder with this name already exist.",
                });
            }
            const data = await gfs.rename(req.body.id, req.body.name);
            res.status(200).json(data);
        }
    }
}
