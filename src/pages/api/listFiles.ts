import getGFS from "@lib/gdrive";
import { getToken } from "@lib/utils";

export default async function listFiles(req, res) {
    const gfs = await getGFS(getToken(req, res));
    if (req.body.folderId == "root") {
        console.log("-> Fetching root contents");
        const data = await gfs.list();
        res.status(200).json(data);
    } else {
        console.log("-> Fetching contents for: ", req.body.folderId);
        const data = await gfs.list(req.body.folderId);
        res.status(200).json(data);
    }
}
