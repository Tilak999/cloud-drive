// @ts-nocheck
import notify from "@lib/notify";
import axios from "axios";
import React, { useEffect, useState } from "react";
import ActionBtn from "./ActionBtn";
import Modal from "./Modal";
import Spinner from "./spinner";

interface PropTypes {
    rootFolder?: string;
    onCompletion: () => void;
    selected: string[];
}

export default function MoveAction({
    rootFolder,
    onCompletion,
    selected,
}: PropTypes) {
    const [visible, setVisible] = useState(false);
    const [isLoading, setLoader] = useState(true);

    const [objects, setObjects] = useState([]);
    const [currentView, setCurrentView] = useState({ items: [] });

    const url = "/api/listFiles";

    const move = async (e) => {
        setVisible(false);
        const notif = notify();
        notif.withLoading(`Moving ${selected.length} items...`);
        axios
            .post("/api/move", {
                destinationId: currentView.id,
                sourceIds: selected,
            })
            .then(() => {
                onCompletion();
                notif.success(`${selected.length} items Moved`);
            });
    };

    const goBack = () => {
        const newList = [...objects];
        newList.pop();
        setCurrentView(newList[newList.length - 1]);
        setObjects(newList);
    };

    const filterResult = (data) => {
        return data.filter(
            (i) =>
                i.mimeType.includes("shortcut") == 0 && !selected.includes(i.id)
        );
    };

    const getObjects = (rootFolder?: string, name?: string) => {
        setLoader(true);
        axios.post(url, { folderId: rootFolder }).then(({ data }) => {
            setLoader(false);
            if (data) {
                const view = {
                    name: name,
                    id: rootFolder,
                    items: filterResult(data),
                };
                setObjects([...objects, view]);
                setCurrentView(view);
            } else {
                console.log("Directory is empty, id:");
            }
        });
    };

    const validateAction = () => {
        if (selected.length > 0) {
            setVisible((v) => !v);
            getObjects(rootFolder, "root");
        } else {
            alert("Select one or more items first.");
        }
    };

    return (
        <React.Fragment>
            <ActionBtn type="move" onClick={() => validateAction()} />
            <Modal
                title="Select destination"
                visible={visible}
                onDismiss={() => setVisible((v) => !v)}
            >
                <Spinner visible={isLoading} />
                <div className={isLoading ? "hidden" : ""}>
                    <ul className="rounded cursor-pointer border-2 m-2 p-3 px-3 border-gray-100">
                        {objects.length > 1 && (
                            <li
                                className="my-1 py-1 text-green-500 text-sm font-semibold "
                                onClick={goBack}
                            >
                                <i className="bi bi-arrow-left px-2"></i> Back
                            </li>
                        )}
                        {objects.length > 0 &&
                            currentView.items.map((obj) => (
                                <li
                                    className="my-1 py-1 hover:bg-green-100"
                                    onClick={() => getObjects(obj.id, obj.name)}
                                    key={obj.id}
                                >
                                    <i className="bi bi-folder2 px-2"></i>
                                    <span className="px-2">{obj.name}</span>
                                </li>
                            ))}
                        {currentView.items.length == 0 && (
                            <div className="text-center py-4 text-sm ">
                                ( No folders inside this directory )
                            </div>
                        )}
                    </ul>

                    <div className="mx-3 text-sm font-semibold">
                        Selected Directory:&nbsp;
                        <span className="text-green-600">
                            {objects.map((i) => i.name).join("/")}
                        </span>
                    </div>
                    <div className="float-right m-3">
                        <button
                            className="rounded text-green-800 bg-green-200 px-4 py-1"
                            onClick={move}
                        >
                            Move
                        </button>
                    </div>
                </div>
            </Modal>
        </React.Fragment>
    );
}
