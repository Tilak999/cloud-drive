import React, { useState } from "react";
import useInterval from "../hooks/useInterval";
import { getTransferQueueStatus } from "../lib/uploadHandler";
import Modal from "./Modal";
import { humanFileSize } from "../../lib/utils";

export default function ActiveTransfers() {
    const [transfers, setTransfers] = useState({
        current_active: null,
        completed: [],
        upload_queue: [],
    });
    const [visible, setVisibility] = useState(false);

    useInterval(() => {
        const status = getTransferQueueStatus();
        setTransfers(status);
        console.log(status.current_active);
    }, 1000);

    const isTransferObjectEmpty = () => {
        return (
            transfers.current_active == null &&
            transfers.completed.length == 0 &&
            transfers.upload_queue.length == 0
        );
    };

    return (
        <React.Fragment>
            <button
                className="hover:bg-green-100 py-2 px-2 rounded-lg bg-gray-100 text-sm"
                onClick={() => setVisibility(!visible)}
            >
                <span className="mx-2">
                    <span></span>Active Transfers
                </span>
            </button>
            <Modal
                visible={visible}
                title={"Active Transfers"}
                onDismiss={() => setVisibility(!visible)}
            >
                {transfers.current_active != null && (
                    <div className="p-3">
                        Active:
                        <div
                            key={transfers.current_active.name}
                            className="hover:bg-green-50 hover:text-green-900 flex flex-row border rounded p-2 my-4"
                        >
                            <div className="mt-4 mx-4">
                                <i className="bi bi-cloud-arrow-up py-2 px-3 bg-green-400 rounded-full "></i>
                            </div>
                            <div>
                                <div className="my-1 break-words">
                                    {transfers.current_active.name}
                                </div>
                                <div className="text-sm">
                                    <span className="mr-2">
                                        Progress:{" "}
                                        {transfers.current_active.percentage}%
                                    </span>
                                    <span className="mx-2">
                                        {`uploaded: ${humanFileSize(
                                            transfers.current_active.loaded
                                        )} of ${humanFileSize(
                                            transfers.current_active.total
                                        )}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {transfers.upload_queue.length > 0 && (
                    <div className="p-3">
                        Queue: ({transfers.upload_queue.length})
                        {transfers.upload_queue.map((file) => (
                            <div
                                key={file.name}
                                className="hover:bg-green-50 hover:text-green-900 flex flex-row border rounded p-2 my-4"
                            >
                                <div className="mt-4 mx-4">
                                    <i className="bi bi-cloud-arrow-up py-2 px-3 bg-green-400 rounded-full "></i>
                                </div>
                                <div>
                                    <div className="my-1 break-words">
                                        {file.name}
                                    </div>
                                    <div className="text-sm">
                                        Size: {humanFileSize(file.total)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {transfers.completed.length > 0 && (
                    <div className="p-3">
                        Completed: ({transfers.completed.length})
                        {transfers.completed.map((file) => (
                            <div
                                key={file.name}
                                className="hover:bg-green-50 hover:text-green-900 flex flex-row border rounded p-2 my-4"
                            >
                                <div className="mt-4 mx-4">
                                    <i className="bi bi-cloud-arrow-up py-2 px-3 bg-green-400 rounded-full"></i>
                                </div>
                                <div>
                                    <div className="my-1 break-words">
                                        {file.name}
                                    </div>
                                    <span className="text-sm text-green-600">
                                        Upload Completed
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {isTransferObjectEmpty() && (
                    <div className="p-6 text-center">No active transfers</div>
                )}
            </Modal>
        </React.Fragment>
    );
}
