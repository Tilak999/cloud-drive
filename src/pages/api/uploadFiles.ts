import GdriveFS from '@ideabox/cloud-drive-fs';
import getGFS from '@lib/gdrive';
import { getToken } from '@lib/utils';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const handler = async (req, res) => {

	return new Promise<void>(async (resolve, reject) => {
		const form = formidable({
			uploadDir: './public/uploads',
			maxFileSize: 15 * 1024 * 1024 * 1024,
			keepExtensions: true
		});
		const gfs = await getGFS(getToken(req, res));
		try {
			await form.parse(req, async (err, fields, files) => {
				const file = files.files[0]
				const { directoryId, relativePath } = fields;
				const destFolderId = await getOrCreateDirectories(gfs, directoryId[0], relativePath[0]);
				const filepath = file.filepath
				console.log(`Uploading.. ${file.originalFilename}`);
				await gfs.uploadFile(fs.createReadStream(file.filepath), {
					name: file.originalFilename,
					size: file.size,
					progress: (e) => { },
					parentId: destFolderId
				});
				fs.rm(filepath, () => console.log('File removed'));
				console.log(`File uploaded to gDrive: ${file.originalFilename}`);
				res.status(200).json({});
			});

		} catch (error) {
			console.error(error);
			res.status(500);
			reject()
		}
	})

};

const getOrCreateDirectories = async (gfs: GdriveFS, directoryId: string, relativePath: string) => {
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

export const config = {
	api: {
		bodyParser: false,
	},
};

export default handler