import getGFS from '@/lib/gdrive';
import { getToken } from '@/lib/utils';
import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function listFiles(req: NextApiRequest, res: NextApiResponse) {
    const gfs = await getGFS(getToken(req, res));
    if (req.body.folderId == "root") {
        console.log("-> Fetching root contents");
        const data = await gfs.list();
        const files = data.files;
        // if (data.nextPageToken) {
        //     let nextPageData: any = {};
        //     do {
        //         nextPageData = await gfs.list(data.nextPageToken);
        //         files.push(...nextPageData.files);
        //     } while (nextPageData.nextPageToken)
        // }
        res.status(200).json({ id: "root", name: "Home", parents: null, files: files });
    } else {
        console.log("-> Fetching contents for: ", req.body.folderId);
        const id = req.body.folderId;
        const promises = [gfs.findById(id), gfs.list(id)];
        const data: any = await Promise.all(promises);
        let files = data[1].files;
        /* tricky bypass to avoid listing root contents */
        if (data[1].nextPageToken) {
            console.log(`-> Fetching contents for next page.`);
            let nextPage: any = {};
            let nextPageToken = data[1].nextPageToken;
            do {
                nextPage = await gfs.list(id, "", nextPageToken);
                files = _.sortBy(_.concat(files, nextPage.files), [(file) => file.name]);
                nextPageToken = nextPage.nextPageToken;
            } while (nextPageToken);
        }
        if (data[0]["parents"]) {
            res.status(200).json({
                files: files,
                ...data[0],
            });
        } else {
            const data = await gfs.list();
            res.status(200).json({ id: "root", name: "Home", parents: null, files: data.files });
        }
    }
}
