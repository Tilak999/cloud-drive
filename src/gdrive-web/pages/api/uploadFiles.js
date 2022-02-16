import Cookies from "cookies";
import getGFS from "../../lib/Gdrive";
import nextConnect from "next-connect";
import multer from "multer";
import fs from "fs";
import path from "path";

// Returns a Multer instance that provides several methods for generating
// middleware that process files uploaded in multipart/form-data format.
const upload = multer({
    storage: multer.diskStorage({
        destination: "./public/uploads",
        filename: (req, file, cb) => cb(null, file.originalname),
    }),
});

const apiRoute = nextConnect({
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
});

const uploadMiddleware = upload.array("files");
apiRoute.use(uploadMiddleware);

async function createPathIfNotExist(gfs, baseDirectory) {
    let root = "gfs:/";
    baseDirectory = baseDirectory.replace("gfs:/", "");
    for (const part of baseDirectory.split("/")) {
        const exist = await gfs.checkIfEntityExist(path.join(root, part));
        if (!exist) {
            console.log("creating dir: ", path.join(root, part));
            await gfs.createDirectory(root, part);
        }
        root = path.join(root, part);
    }
}

// Process a POST request
apiRoute.post(async (req, res) => {
    const cookie = new Cookies(req, res);
    const gfs = await getGFS(cookie.get("token"));
    try {
        for (const file of req.files) {
            console.log(`Uploading.. ${file.filename}`);
            const filepath = path.join(file.destination, file.filename);
            await createPathIfNotExist(gfs, req.body.path);
            await gfs.uploadFile(req.body.path, fs.createReadStream(filepath), {
                filename: file.filename,
                filesize: file.size,
                onUploadProgress: (e) => {},
            });
            fs.rm(filepath, () => console.log("file removed"));
            console.log(`File uploaded to gdrive: ${file.filename}`);
        }
        res.status(200).json(req.files);
    } catch (e) {
        console.error(e);
        res.status(500);
    }
});

export default apiRoute;

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};
