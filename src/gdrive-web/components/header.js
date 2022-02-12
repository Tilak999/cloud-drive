import { useContext, useState } from "react";
import { humanFileSize } from "../../lib/utils";
import GlobalStore from "../context/GlobalStore";
import Modal from "./Modal";
import StorageInfoBtn from "./StorageInfoBtn";

export default function Header({ title }) {
    const ctx = useContext(GlobalStore);
    const [isModalVisible, setModalVisibility] = useState(false);

    const getTransfers = () => {
        const transfers = ctx.store.uploads || {};
        const list = [];
        for (const key of Object.keys(transfers)) {
            list.push({
                name: key,
                total: transfers[key].total,
                loaded: transfers[key].loaded,
                progress: (transfers[key].loaded / transfers[key].total) * 100,
            });
        }
        return list;
    };

    return (
        <div className="bg-white w-full h-12 shadow z-10 flex flex-row justify-between">
            <div className="font-semibold text-lg my-2 mx-4">
                <i className="bi bi-hdd-network mx-2"></i> {title}
            </div>
            <div className="my-1 text-sm flex flex-row space-x-3 mr-2">
                <button
                    className="hover:bg-green-100 py-2 px-2 rounded-lg bg-gray-100"
                    onClick={() => setModalVisibility(!isModalVisible)}
                >
                    <span className="rounded-full px-3 py-1 bg-green-400 animate-pulse">
                        {getTransfers().length}
                    </span>
                    <span className="mx-2">Active Transfers</span>
                </button>
                <StorageInfoBtn className="hover:bg-green-100 py-2 px-2 rounded-lg bg-gray-100" />
                <a
                    href="/api/logout"
                    className="hover:bg-green-100 py-2 px-2 rounded-lg bg-gray-100"
                >
                    Logout
                </a>
            </div>
            <Modal
                visible={isModalVisible}
                title={"Active Transfers"}
                onDismiss={setModalVisibility}
            >
                <div className="p-3">
                    {getTransfers().length == 0 ? (
                        <div className="text-center text-gray-800">
                            No active uploads
                        </div>
                    ) : (
                        getTransfers().map((file) => (
                            <div className="hover:bg-green-50 hover:text-green-900 flex flex-row border rounded p-2 my-4">
                                <div className="mt-4 mx-4">
                                    <i className="bi bi-cloud-arrow-up py-2 px-3 bg-green-400 rounded-full "></i>
                                </div>
                                <div>
                                    <div className="my-1 break-words">
                                        {file.name}
                                    </div>
                                    <div className="text-sm">
                                        progress: {file.progress.toFixed(2)}%
                                        &nbsp; uploaded:{" "}
                                        {humanFileSize(file.loaded)} of{" "}
                                        {humanFileSize(file.total)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    );
}
