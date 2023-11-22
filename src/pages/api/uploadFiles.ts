// @ts-nocheck

import getGFS from "@/lib/gdrive";
import { getToken } from "@/lib/utils";
import GdriveFS from "@ideabox/cloud-drive-fs";
import formidable from "formidable";
import fs from "fs";
import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>(async (resolve, reject) => {
        const form = formidable({
            uploadDir: "cachedFiles",
            maxFileSize: 15 * 1024 * 1024 * 1024,
            keepExtensions: true,
        });
        const gfs = await getGFS(getToken(req, res));
        let filePath = "";
        try {
            form.parse(req, async (err, fields, files) => {
                const file = _.get(files, "files[0]", null);
                if (err || !file) {
                    console.error("Error reading files", err, files);
                    res.status(500);
                    reject();
                    return;
                }
                const { directoryId, relativePath } = fields;
                const destFolderId = await getOrCreateDirectories(
                    gfs,
                    directoryId[0],
                    relativePath[0]
                );
                filePath = file.filepath;
                console.log(`Uploading.. ${file.originalFilename}`);
                await gfs.uploadFile(fs.createReadStream(filePath), {
                    name: file.originalFilename,
                    size: file.size,
                    progress: (e) => {},
                    parentId: destFolderId,
                });
                fs.rm(filePath, () => console.log("File removed"));
                console.log(`File uploaded to gDrive: ${file.originalFilename}`);
                res.status(200).json({});
            });
        } catch (error) {
            console.error(error);
            if (filePath !== "") {
                fs.rm(filePath, () => console.log("File removed"));
            }
            res.status(500);
            reject();
        }
    });
};

const getOrCreateDirectories = async (gfs: GdriveFS, directoryId: string, relativePath: string) => {
    let parentId = directoryId;
    if (relativePath && relativePath.trim() != "") {
        const directories = path.parse(relativePath).dir.split("/");
        for (const folderName of directories) {
            const data = await gfs.findByName(folderName, parentId);
            if (data && data.id) {
                parentId = data.id;
            } else {
                console.log("->", "Creating directory: ", folderName);
                const data = await gfs.createFolder(folderName, parentId);
                if (data && data.id) parentId = data.id;
                else throw "Failed to create directory path:" + relativePath;
            }
        }
    }
    return parentId;
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;
