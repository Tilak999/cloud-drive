import Cookies from "cookies";

export default async function logout(req, res) {
    const cookies = new Cookies(req, res);
    const uuid = cookies.get("token");
    if (uuid) {
        global[uuid] = null;
    }
    cookies.set("token", null);
    res.redirect("/");
}
