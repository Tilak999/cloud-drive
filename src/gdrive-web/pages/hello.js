import axios from "axios";
import { useEffect, useState } from "react";
import FileTree from "../components/filetree";
import Header from "../components/header";
import { LeftArrow, MoveFile } from "../components/icons";

function HomePage() {
    const [filetree, setFiletree] = useState([]);

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
            const { data } = await axios.post("/api/listFiles", {
                path: target.path,
            });
            target["childrens"] = data.files;
            setFiletree([...filetree]);
        }
    };

    useEffect(async () => {
        fetchFiles();
    }, []);

    return (
        <div className="w-full h-screen bg-gray-50 flex flex-col">
            <Header title="GDrive" />
            <div className="flex flex-row flex-1">
                <div className="w-72 bg-white shadow-sm">
                    <div className="bg-green-600 text-white px-2 py-1 text-sm">
                        File Tree
                    </div>
                    <div className="pt-2 text-gray-700">
                        <FileTree nodes={filetree} onClick={fetchFiles} />
                    </div>
                </div>
                <div className="flex-grow p-2">
                    <div className="w-full bg-white rounded p-3">
                        <div className="flex justify-between">
                            <h2 className="px-3 py-1">
                                <LeftArrow className="inline-block mr-2" /> Home
                            </h2>
                            <div className="space-x-2">
                                <button className="px-3 py-1 rounded bg-gray-50">
                                    <MoveFile className="inline-block mr-2" />
                                    <span>New Folder</span>
                                </button>
                                <button className="px-3 py-1 rounded bg-gray-50">
                                    <MoveFile className="inline-block mr-2" />
                                    <span>Move</span>
                                </button>
                                <button className="px-3 py-1 rounded bg-gray-50">
                                    <MoveFile className="inline-block mr-2" />
                                    <span>Delete</span>
                                </button>
                                <button className="px-3 py-1 rounded bg-gray-50">
                                    <MoveFile className="inline-block mr-2" />
                                    <span>Download</span>
                                </button>
                                <button className="px-4 py-1 rounded bg-green-600 text-white">
                                    <MoveFile className="inline-block mr-2" />
                                    <span>Upload</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
