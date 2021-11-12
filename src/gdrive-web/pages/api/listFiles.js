import getGFS from "../../lib/setup-gfs";

export default async function listFiles(req, res) {
    const gfs = getGFS(process.env.GFS_KEY_FILE);
    const data = await gfs.list(req.body.path || "gfs:/", true);

    res.status(200).json({
        files: [
            ...data.files.filter((f) => f.mimeType.endsWith("folder")),
            ...data.files.filter((f) => f.mimeType.endsWith("symlink")),
        ],
    });
}
