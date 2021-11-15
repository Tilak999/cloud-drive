import axios from "axios";
import { useEffect, useState } from "react";
import Button from "../components/button";
import FileActions from "../components/fileActions";
import FileListItem from "../components/filelist";
import FileTree from "../components/filetree";
import Header from "../components/header";
import { LeftArrow, MoveFile } from "../components/icons";
import Spinner from "../components/spinner";

function HomePage() {
    const [filetree, setFiletree] = useState([]);
    const [isRunning, showSpinner] = useState(true);
    const [history, setHistory] = useState([]);
    const [currentView, setCurrentView] = useState({
        title: "",
        childrens: [],
    });

    const fetchFiles = async (nodeId) => {
        if (filetree.length == 0 || nodeId == null) {
            const { data } = await axios.post("/api/listFiles");
            setFiletree(data.files);
        } else {
            const items = nodeId.split(",");
            let target = filetree;
            for (let i of items) {
                target = target[i] || target.childrens[i];
            }
            if (target.childrens != null) {
                target["childrens"] = null;
                setFiletree([...filetree]);
            } else {
                target["loading"] = true;
                setFiletree([...filetree]);
                const { data } = await axios.post("/api/listFiles", {
                    path: target.path,
                });
                target["childrens"] = data.files;
                target["loading"] = false;
                setFiletree([...filetree]);
            }
        }
    };

    const loadFiles = async (node) => {
        showSpinner(true);
        const { data } = await axios.post("/api/listFiles", {
            path: node.path,
        });
        setCurrentView({
            title: node.name,
            childrens: data.files,
        });
        setHistory([...history, node]);
        showSpinner(false);
    };

    const goBack = async () => {
        history.pop();
        const node = history.pop();
        loadFiles(node);
    };

    useEffect(() => {
        fetchFiles();
        loadFiles({ path: "gfs:/", name: "Home" });
    }, []);

    return (
        <div className="w-full h-screen bg-gray-100 flex flex-col">
            <div>
                <Header title="Cloud Drive" />
            </div>
            <div className="flex flex-row flex-grow overflow-y-auto">
                <div className="w-72 bg-white shadow-sm flex flex-col m-2 rounded">
                    <div className="bg-green-600 text-white px-2 py-2 rounded">
                        <i className="bi bi-folder2-open mx-2"></i>
                        <span>File Tree</span>
                    </div>
                    <div className="text-gray-600 overflow-scroll flex-grow mr-2 my-2">
                        <FileTree
                            nodes={filetree}
                            onExpandFolder={fetchFiles}
                            onFolderSelection={loadFiles}
                        />
                    </div>
                </div>
                <div className="flex-grow m-2">
                    <div className="flex flex-col w-full h-full bg-white rounded">
                        <div className="flex justify-between p-4 mb-2 shadow-sm">
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
                                <FileActions disableAll={true} />
                            </div>
                        </div>
                        <div className="flex-grow pb-4 overflow-scroll">
                            {!isRunning &&
                                currentView.childrens.map((file) => (
                                    <FileListItem
                                        file={file}
                                        onClick={loadFiles}
                                    />
                                ))}
                            <div className="mt-4">
                                <Spinner visible={isRunning} text="Fetching" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
