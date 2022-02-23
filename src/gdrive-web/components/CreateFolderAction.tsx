import axios from "axios";
import React from "react";
import notify from "../lib/notify";
import FileActionBtn from "@components/FileActionBtn";

export default function CreateFolderAction({ directoryPath, onCompletion }) {
    const onClick = () => {
        const directoryName = window.prompt("Folder Name");
        if (directoryName) {
            const status = notify().withLoading("Creating folder..");
            axios
                .post("/api/createFolder", { directoryPath, directoryName })
                .then(() => {
                    onCompletion();
                    status.success("Folder created: " + directoryName);
                });
        }
    };

    return (
        <React.Fragment>
            <FileActionBtn type="createFolder" onClick={onClick} />
        </React.Fragment>
    );
}
