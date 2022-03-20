// @ts-nocheck
import React, { useRef, useState } from "react";
import FileActionBtn from "./FileActionBtn";
import uploadFile from "../lib/uploadHandler";
import Modal from "./Modal";

export default function UploadAction({ directoryId, onCompletion }) {
    const inputFolder = useRef();
    const inputFile = useRef();
    const [visible, setVisible] = useState(false);

    const uploadFiles = async (e) => {
        setVisible((v) => !v);
        for (const file of e.target.files) {
            uploadFile({ directoryId, file });
        }
    };

    return (
        <React.Fragment>
            <FileActionBtn
                type="upload"
                onClick={() => setVisible((v) => !v)}
            />
            <input
                ref={inputFolder}
                type="file"
                webkitdirectory=""
                mozdirectory=""
                className="w-0 h-0"
                onChange={(e) => uploadFiles(e)}
            />
            <input
                ref={inputFile}
                type="file"
                multiple
                className="w-0 h-0"
                onChange={(e) => uploadFiles(e)}
            />
            <Modal
                title="Upload"
                visible={visible}
                onDismiss={() => setVisible((v) => !v)}
            >
                <div className="border-dashed border-2 m-6 p-12 border-green-700 rounded-lg text-center">
                    [WIP] Drag and Drop files or folder to upload
                </div>
                <div className="space-x-4 mx-auto text-center my-3">
                    <button
                        className="rounded text-green-800 bg-green-200 px-4 py-2"
                        onClick={() => inputFile.current.click()}
                    >
                        <i className="bi bi-file-earmark-arrow-up"></i> Upload
                        File
                    </button>
                    <button
                        className="rounded text-green-800 bg-green-200 px-4 py-2"
                        onClick={() => inputFolder.current.click()}
                    >
                        <i className="bi bi-folder2"></i> Upload Folder
                    </button>
                </div>
            </Modal>
        </React.Fragment>
    );
}
