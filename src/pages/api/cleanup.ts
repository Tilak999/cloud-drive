import Cookies from "cookies";
import { NextApiRequest, NextApiResponse } from "next";

export default async function cleanup(req: NextApiRequest, res: NextApiResponse) {
    const cookie = new Cookies(req, res);
    //const gfs = await getGFS(cookie.get("token"));
    //await gfs.cleanup();
    res.status(200).json({ status: "done" });
}
