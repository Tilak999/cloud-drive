import getGFS from "@lib/gdrive";
import { assertNotEmpty, getToken } from "@lib/utils";

export default async function downloadFile(req, res) {
    try {
        const gfs = await getGFS(getToken(req, res));
        assertNotEmpty(req.query.id, "File id can't be empty!");
        const result = await gfs.download(req.query.id);
        res.writeHead(200, {
            ...(result.length && { "Content-Length": result.length }),
            "Content-Disposition": `attachment; filename="${result.name}"`,
            "Transfer-Encoding": "chunked",
        });
        result.data.pipe(res);
    } catch (e) {
        res.status(400).json({
            message: e,
        });
    }
}
