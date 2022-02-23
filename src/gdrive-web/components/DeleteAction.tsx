import axios from "axios";
import React from "react";
import notify from "../lib/notify";

import FileActionBtn from "./FileActionBtn";

export default function DeleteAction({ selectedFiles, onCompletion }) {
    const onClick = async () => {
        const confirm = window.confirm(
            "Delete " + selectedFiles.length + " items ?"
        );
        if (confirm) {
            const notification = notify().withLoading(
                "Deleting " + selectedFiles.length + " items..."
            );
            await axios.post("/api/deleteFiles", { files: selectedFiles });
            onCompletion();
            notification.success("Done");
        }
    };

    return (
        <React.Fragment>
            <FileActionBtn type="delete" onClick={onClick} />
        </React.Fragment>
    );
}
