import axios from "axios";
import { useEffect, useState } from "react";
import FileTree from "../components/filetree";
import Header from "../components/header";
import FileView from "../components/FileView";
import { useRouter } from "next/dist/client/router";

function HomePage() {
    const home = {
        name: "Home",
        path: "gfs:/",
    };
    const [filetree, setFiletree] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(home);
    const router = useRouter();

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

    useEffect(() => {
        fetchFiles().catch(() => router.replace("/"));
    }, []);

    return (
        <div className="w-full h-screen bg-gray-100 flex flex-col">
            <div>
                <Header title="Cloud Drive" />
            </div>
            <div className="flex flex-row h-full">
                <div className="bg-white flex flex-col flex-none w-72 m-2">
                    <div className="bg-green-600 text-white px-2 py-2 rounded">
                        <i className="bi bi-house-fill mx-2"></i>
                        <button onClick={() => setSelectedFolder(home)}>
                            Home
                        </button>
                    </div>
                    <div className="text-gray-600 overflow-auto mr-2 my-2 flex-auto">
                        <FileTree
                            nodes={filetree}
                            onExpandFolder={fetchFiles}
                            onFolderSelection={setSelectedFolder}
                        />
                    </div>
                </div>
                <div className="bg-white flex-auto w-64 m-2">
                    <FileView directoryNode={selectedFolder} />
                </div>
            </div>
        </div>
    );
}

export default HomePage;
