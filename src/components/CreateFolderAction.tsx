import axios from "axios";
import React from "react";
import notify from "../lib/notify";
import ActionBtn from "@components/ActionBtn";

export default function CreateFolderAction({ directoryId, onCompletion }) {
    const onClick = () => {
        const directoryName = window.prompt("Folder Name");
        if (directoryName) {
            const status = notify().withLoading("Creating folder..");
            axios
                .post("/api/createFolder", { directoryId, directoryName })
                .then(() => {
                    onCompletion();
                    status.success("Folder created: " + directoryName);
                });
        }
    };

    return (
        <React.Fragment>
            <ActionBtn type="createFolder" onClick={onClick} />
        </React.Fragment>
    );
}
