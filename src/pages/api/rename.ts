import getGFS from "@lib/gdrive";
import { assertNotEmpty, getToken } from "@lib/utils";

export default async function rename(req, res) {
    try {
        const gfs = await getGFS(getToken(req, res));
        const { id, name } = req.body;
        assertNotEmpty(id, "Id can't be empty");
        assertNotEmpty(name, "Id can't be empty");
        const item = await gfs.findById(id);
        if (item && item.parents[0]) {
            const list = await gfs.list(item.parents[0]);
            const matchedItems = list.files.filter(
                (i) => i.name.toLowerCase() == name.toLowerCase() && i.id != id
            );
            if (matchedItems.length > 0) {
                return res.status(400).json({
                    errorMsg: "File/Folder with this name already exist.",
                });
            }
            const data = await gfs.rename(id, name);
            res.status(200).json(data);
        } else {
            res.status(500).json({ error: "rename method" });
        }
    } catch (e) {
        res.status(400).json({ message: e });
    }
}
