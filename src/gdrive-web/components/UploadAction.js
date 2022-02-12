import React, { useContext, useRef } from "react";
import FileActionBtn from "./FileActionBtn";
import axios, { Axios } from "axios";
import GlobalStore from "../context/GlobalStore";
import notify from "../lib/notify";

export default function UploadAction({ directoryPath, onCompletion }) {
    const input = useRef();
    const context = useContext(GlobalStore);

    const uploadFiles = async (e) => {
        for (const file of e.target.files) {
            const formdata = new FormData();
            const notification = notify().withLoading(
                "Uploading: " + file.name
            );
            formdata.set("files", file);
            formdata.set("path", directoryPath);
            const resp = await axios.post("/api/uploadFiles", formdata, {
                onUploadProgress: (progress) => {
                    const uploads = context.store.uploads || {};
                    uploads[file.name] = progress;
                    context.setStore({
                        ...context.store,
                        uploads,
                    });
                },
            });
            if (resp.status == "200") {
                onCompletion();
                notification.success("Finished uploading");
            }
        }
    };

    return (
        <React.Fragment>
            <FileActionBtn
                type="upload"
                onClick={() => input.current.click()}
            />
            <input
                ref={input}
                type="file"
                className="w-0 h-0"
                multiple
                onChange={(e) => uploadFiles(e)}
            />
        </React.Fragment>
    );
}
