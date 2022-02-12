import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "./button";
import Spinner from "./spinner";
import UploadAction from "./UploadAction";
import FileList from "./FileList";
import DeleteAction from "./DeleteAction";
import CreateFolderAction from "./CreateFolderAction";

export default function FileView({ directoryNode }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [currentView, setCurrentView] = useState({
        title: "",
        childrens: [],
    });

    const loadFiles = async (node) => {
        if (node.mimeType == null || node.mimeType.endsWith("folder")) {
            setLoading(true);
            const { data } = await axios.post("/api/listFiles", {
                path: node.path,
            });
            setCurrentView({
                title: node.name,
                path: node.path,
                childrens: data.files,
            });
            setHistory([...history, node]);
            setLoading(false);
        } else {
            console.log(node);
            window.location = `/api/download?path=${node.path}`;
        }
    };

    const goBack = async () => {
        history.pop();
        const node = history.pop();
        loadFiles(node);
    };

    const refreshView = async () => {
        setLoading(true);
        const { data } = await axios.post("/api/listFiles", {
            path: currentView.path,
        });
        setCurrentView({
            ...currentView,
            childrens: data.files,
        });
        setLoading(false);
    };

    useEffect(() => {
        console.log(directoryNode.path);
        loadFiles(directoryNode);
    }, [directoryNode]);

    return (
        <React.Fragment>
            <div className="flex justify-between p-4 shadow-sm">
                <h2 className="px-2 py-1 text-lg overflow-hidden overflow-ellipsis whitespace-nowrap max-w-sm">
                    <Button
                        hidden={history.length <= 1}
                        className="px-2 hover:bg-green-50 hover:text-green-700 rounded-full"
                        onClick={goBack}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </Button>
                    <span className="mx-2 font-semibold">
                        {currentView.title}
                    </span>
                </h2>
                <div className="space-x-1 text-lg">
                    <button
                        onClick={refreshView}
                        className="cursor-pointer p-2"
                        title="refresh view"
                    >
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <CreateFolderAction
                        directoryPath={currentView.path}
                        onCompletion={refreshView}
                    />
                    <DeleteAction
                        selectedFiles={selectedFiles}
                        onCompletion={refreshView}
                    />
                    <UploadAction
                        directoryPath={currentView.path}
                        onCompletion={refreshView}
                    />
                </div>
            </div>
            <div className="flex-grow pb-4">
                {!loading && (
                    <FileList
                        directory={currentView}
                        onClick={loadFiles}
                        onSelection={setSelectedFiles}
                    />
                )}
                <div className="mt-4">
                    <Spinner visible={loading} text="Fetching" />
                </div>
            </div>
        </React.Fragment>
    );
}
