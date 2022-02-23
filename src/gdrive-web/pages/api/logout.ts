import Cookies from "cookies";

export default async function logout(req, res) {
    const cookies = new Cookies(req, res);
    cookies.set("token", null);
    res.redirect("/");
}
