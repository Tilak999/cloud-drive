const Table = require("cli-table");
const crypto = require("crypto");

module.exports = {
    isValidGfsPath(path) {
        return path && path.startsWith("gfs:/");
    },

    table(head) {
        const chars = {
            top: " ",
            "top-mid": "",
            "top-left": "",
            "top-right": "",
            bottom: " ",
            "bottom-mid": "",
            "bottom-left": "",
            "bottom-right": "",
            left: "",
            "left-mid": "",
            mid: "",
            "mid-mid": "",
            right: "",
            "right-mid": "",
            middle: "\t",
        };
        return new Table({
            head,
            chars,
        });
    },

    humanFileSize(size) {
        if (size == 0) return "0 B";
        let i = Math.floor(Math.log(size) / Math.log(1024));
        return (
            (size / Math.pow(1024, i)).toFixed(2) * 1 +
            " " +
            ["B", "KB", "MB", "GB", "TB"][i]
        );
    },

    validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    },

    calcHash(somestring) {
        return crypto
            .createHash("md5")
            .update(somestring)
            .digest("hex")
            .toString();
    },
};
