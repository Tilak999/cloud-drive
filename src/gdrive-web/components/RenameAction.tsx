import notify from "@lib/notify";
import axios from "axios";
import ActionBtn from "./ActionBtn";

export default function RenameAction({ objectId, items, onCompletion }) {
    const renameActionClick = () => {
        if (objectId.length == 0)
            return alert("Select a file/folder to rename");
        if (objectId.length > 1)
            return alert("Rename can only be performed on single item.");
        const item = items.filter((item) => item.id == objectId)[0];
        const name = prompt("Rename", item.name);
        const kind = item.mimeType.includes("folder") > 0 ? "folder" : "file";
        if (name != null) {
            const status = notify().withLoading(`Renaming ${kind} ..`);
            axios
                .post("/api/rename", { id: item.id, name })
                .then(() => {
                    onCompletion();
                    status.success(`${kind} renamed: ${name}`);
                })
                .catch((e) => {
                    status.failed(e.response.data.errorMsg);
                });
        }
    };

    return <ActionBtn type="rename" onClick={renameActionClick} />;
}
