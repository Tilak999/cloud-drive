import Cookies from "cookies";
import getGFS from "@lib/gdrive";

export default async function downloadFile(req, res) {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));
    const fileId = req.query.id;
    if (fileId != null) {
        const result = await gfs.download(fileId);
        res.writeHead(200, {
            "Content-Length": result.length,
            "Content-Disposition": `attachment; filename="${result.name}"`,
        });
        result.data.pipe(res);
    } else {
        res.status(404);
    }
}
