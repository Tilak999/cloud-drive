const express = require("express");
const app = express();
const port = 3000;

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/list", async (req, res) => {
    const path = req.body.path == null ? "gfs:/" : req.body.path;
    const resp = await app.gfs.list(path, true);
    res.send(resp);
});

module.exports = (gfs, debug) => {
    app.gfs = gfs;
    app.debug = debug;
    app.listen(port, () => {
        console.log(`WebUI running at http://localhost:${port}`);
    });
};
