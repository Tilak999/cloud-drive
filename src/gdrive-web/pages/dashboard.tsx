import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FileList from "@components/FileList";
import Header from "@components/header";
import Breadcrumb from "@components/Breadcrumb";
import CreateFolderAction from "@components/CreateFolderAction";
import DeleteAction from "@components/DeleteAction";
import UploadAction from "@components/UploadAction";

export default function Folder() {
    const router = useRouter();
    const [items, setItems] = useState(null);
    const [currentPath, setCurrentPath] = useState(["Home"]);
    const [selected, setSelection] = useState([]);
    const url = "/api/listFiles";

    const loadFiles = () => {
        const folderId = router.query.folderId || "root";
        if (router.query.path && typeof router.query.path == "string")
            setCurrentPath(router.query.path.split("/"));
        setItems(null);
        axios.post(url, { folderId }).then(({ data }) => {
            if (data) {
                setItems(data);
            } else {
                console.log("Directory is empty, id:");
            }
        });
    };

    const folderSelected = (id: string, name: string) => {
        const slug = `${name}:${id}`;
        const path = `/dashboard?folderId=${id}&path=${[
            ...currentPath,
            slug,
        ].join("/")}`;
        router.push(path);
    };

    const onSelectionChange = (ids) => {
        setSelection(ids);
    };

    useEffect(loadFiles, [router.query]);

    return (
        <div className="w-full h-screen bg-gray-200 flex flex-col">
            <div>
                <Header title="Cloud Drive" />
            </div>
            <div className="mx-4 mt-4 flex flex-row">
                <div className="flex-grow pt-1 pl-1">
                    <Breadcrumb chunks={currentPath} />
                </div>
                <div>
                    <CreateFolderAction
                        directoryId={router.query.folderId}
                        onCompletion={loadFiles}
                    />
                    <DeleteAction ids={selected} onCompletion={loadFiles} />
                    <UploadAction
                        directoryId={router.query.folderId}
                        onCompletion={loadFiles}
                    />
                </div>
            </div>
            <div className="flex flex-row h-full">
                <div className="bg-white rounded-lg overflow-auto m-3 shadow">
                    <FileList
                        items={items}
                        onFolderSelection={folderSelected}
                        onSelectionChange={onSelectionChange}
                    />
                </div>
            </div>
        </div>
    );
}
