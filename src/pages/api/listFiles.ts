import getGFS from "../../lib/gdrive";
import { getToken } from "../../lib/utils";

export default async function listFiles(req, res) {
    const gfs = await getGFS(getToken(req, res));
    if (req.body.folderId == "root") {
        console.log("-> Fetching root contents");
        const data = await gfs.list();
        res.status(200).json({ id: "root", name: "Home", parents: null, files: data });
    } else {
        console.log("-> Fetching contents for: ", req.body.folderId);
        const id = req.body.folderId;
        const promises = [gfs.findById(id), gfs.list(id)];
        const data = await Promise.all(promises);
        /* tricky bypass to avoid listing root contents */
        if (data[0]["parents"]) {
            res.status(200).json({
                files: data[1],
                ...data[0],
            });
        } else {
            const data = await gfs.list();
            res.status(200).json({ id: "root", name: "Home", parents: null, files: data });
        }
    }
}
