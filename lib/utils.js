const Table = require("cli-table");

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
};
