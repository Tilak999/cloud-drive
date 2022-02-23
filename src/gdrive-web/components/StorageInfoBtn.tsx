import axios from "axios";
import React, { useState } from "react";
import { humanFileSize } from "../../lib/utils";

import notify from "../lib/notify";
import Modal from "./Modal";

export default function StorageInfoBtn(props) {
    const [isModalVisible, setModalVisibility] = useState(false);
    const [storageInfo, setStorageInfo] = useState(null);

    const getInformation = () => {
        setModalVisibility(true);
        setStorageInfo(null);
        axios
            .get("/api/getStorageInfo")
            .then((resp) => {
                if (resp.status == 200) {
                    const free =
                        parseInt(resp.data.limit) - parseInt(resp.data.usage);
                    setStorageInfo({
                        usagePercentage:
                            parseInt(resp.data.usage) /
                            parseInt(resp.data.limit),
                        total: humanFileSize(resp.data.limit),
                        used: humanFileSize(resp.data.usage),
                        free: humanFileSize(free),
                    });
                }
            })
            .catch((e) => {
                setModalVisibility(false);
                notify().failed("Error occured: see console logs");
                console.error(e);
            });
    };

    return (
        <React.Fragment>
            <button {...props} onClick={getInformation}>
                <i className="bi bi-hdd text-lg align-middle mr-1"></i> Storage
                Info
            </button>
            <Modal
                visible={isModalVisible}
                title={"Storage Information"}
                onDismiss={setModalVisibility}
            >
                {storageInfo ? (
                    <div className="text-base space-y-2 p-4">
                        <progress
                            className="w-full"
                            value={storageInfo.usagePercentage}
                            max={1}
                        />
                        <div>Total storage: {storageInfo.total}</div>
                        <div>Used: {storageInfo.used}</div>
                        <div>Free: {storageInfo.free}</div>
                    </div>
                ) : (
                    <div className="p-4">
                        Fetching information.. please wait.
                    </div>
                )}
            </Modal>
        </React.Fragment>
    );
}
