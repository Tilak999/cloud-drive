import axios from "axios";
import React from "react";
import notify from "../lib/notify";

import FileActionBtn from "./FileActionBtn";

export default function DeleteAction({ ids, onCompletion }) {
    const onClick = async () => {
        const confirm = window.confirm("Delete " + ids.length + " items ?");
        if (confirm) {
            const notification = notify().withLoading(
                "Deleting " + ids.length + " items..."
            );
            await axios.post("/api/deleteObjects", { ids });
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
