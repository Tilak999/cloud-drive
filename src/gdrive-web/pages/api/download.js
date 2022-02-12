import Cookies from "cookies";
import getGFS from "../../lib/Gdrive";
import path from "path";

export default async function downloadFile(req, res) {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));

    if (req.query.path != null) {
        const source = req.query.path;
        const filename = path.basename(source);
        const result = await gfs.downloadFile(source);

        res.writeHead(200, {
            "Content-Length": result.length,
            "Content-Disposition": `attachment; filename="${filename}"`,
        });
        result.data.pipe(res);
    } else {
        res.status(404);
    }
}
