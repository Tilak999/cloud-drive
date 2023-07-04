import GdriveFS from '@ideabox/cloud-drive-fs';
import getGFS from '@lib/gdrive';
import { getToken } from '@lib/utils';
import fs from 'fs';
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import path from 'path';

// Returns a Multer instance that provides several methods for generating
// middleware that process files uploaded in multipart/form-data format.
const upload = multer({
	storage: multer.diskStorage({
		destination: './public/uploads',
		filename: (req, file, cb) => cb(null, file.originalname)
	})
});

const apiRoute = createRouter<NextApiRequest, NextApiResponse>();

const uploadMiddleware = upload.array('files');
apiRoute.use(uploadMiddleware);

interface NextApiRequestWithFile extends NextApiRequest {
	files?: any;
}

async function getOrCreateDirectories(gfs: GdriveFS, directoryId: string, relativePath: string) {
	let parentId = directoryId;
	if (relativePath && relativePath.trim() != '') {
		const directories = path.parse(relativePath).dir.split('/');
		for (const folderName of directories) {
			const data = await gfs.findByName(folderName, parentId);
			if (data && data.id) {
				parentId = data.id;
			} else {
				console.log('->', 'Creating directory: ', folderName);
				const data = await gfs.createFolder(folderName, parentId);
				parentId = data.id;
			}
		}
	}
	return parentId;
}

// Process a POST request
apiRoute.post(async (req: NextApiRequestWithFile, res: NextApiResponse) => {
	const gfs = await getGFS(getToken(req, res));
	try {
		for (const file of req.files) {
			const { directoryId, relativePath } = req.body;
			const destFolderId = await getOrCreateDirectories(gfs, directoryId, relativePath);
			const filepath = path.join(file.destination, file.filename);
			try {
				console.log(`Uploading.. ${file.filename}`);
				await gfs.uploadFile(fs.createReadStream(filepath), {
					name: file.filename,
					size: file.size,
					progress: (e) => {},
					parentId: destFolderId
				});
			} catch (error) {
				console.error(error);
			}
			fs.rm(filepath, () => console.log('File removed'));
			console.log(`File uploaded to gDrive: ${file.filename}`);
		}
		res.status(200).json(req.files);
	} catch (error) {
		console.error(error);
		res.status(500);
	}
});

export default apiRoute;

export const config = {
	api: {
		bodyParser: false // Disallow body parsing, consume as stream
	}
};
