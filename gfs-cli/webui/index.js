const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const utils = require("../../lib/utils");
const port = 3000;

module.exports = (gfs, debug) => {
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);

    app.use(express.static(__dirname + "/public"));

    io.on("connection", (socket) => {
        console.log("Client Connected..");

        const getList = (file) => {
            gfs.list(file.path, true).then((data) => {
                data.files = data.files.map((file) => ({
                    ...file,
                    fileSize: file.isDirectory
                        ? ""
                        : utils.humanFileSize(file.fileSize),
                    createDate: new Date(file.modifiedTime).toLocaleString(),
                }));
                socket.emit("list", data);
            });
        };

        getList({ path: "gfs:/" });
        socket.on("get-list", getList);
        socket.on("delete", (file) => {
            if (file.isDirectory) gfs.deleteDirectory(file.path, true);
            else gfs.deleteFile(file.path);
        });
    });

    server.listen(port, () => {
        console.log(`gfs web ui running at http://localhost:${port}`);
    });
};
