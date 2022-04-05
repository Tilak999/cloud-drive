import getGFS from "../../lib/gdrive";
import { assertNotEmpty, getToken } from "../../lib/utils";

export default async function deleteObjects(req, res) {
    try {
        const gfs = await getGFS(getToken(req, res));
        for (const id of req.body.ids) {
            assertNotEmpty(id) && (await gfs.delete(id));
        }
        res.status(200).json({ message: "done" });
    } catch (e) {
        res.status(400).json({ message: e });
    }
}
