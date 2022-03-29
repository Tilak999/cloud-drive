import React, { useEffect, useState } from "react";
import Spinner from "./spinner";
import Checkbox from "./Checkbox";
import Icon from "./Icon";
import { formatDate, humanFileSize } from "@lib/utils";

interface PropType {
    items: any[];
    onFolderSelection: (id: string, name: string) => void;
    onSelectionChange: (items: string[]) => void;
}

export default function FileList(props: PropType) {
    const { items, onFolderSelection, onSelectionChange } = props;
    const [selectedItems, setSelection] = useState([]);

    const action = (mimeType: string, id: string, name: string) => {
        if (mimeType.includes("folder")) onFolderSelection(id, name);
        else window.open("/api/download?id=" + id);
    };

    const onCheckboxSelected = (id: string, checked: boolean) => {
        const list = checked ? [...selectedItems, id] : [...selectedItems.filter((i) => i != id)];
        setSelection(list);
        onSelectionChange(list);
    };

    useEffect(() => setSelection([]), [items]);

    return (
        <React.Fragment>
            <table className="border-collapse w-full table-fixed hidden sm:table">
                <thead className="border-b-2 border-gray-100 bg-gray-50">
                    <tr className="text-left font-semibold">
                        <th className="w-16 py-2"></th>
                        <th className="py-2">Name</th>
                        <th className="py-2 w-28">Size</th>
                        <th className="py-2 w-40">Create Date</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600">
                    <tr>
                        <td colSpan={4} className="text-center">
                            <Spinner visible={items == null} text="Fetching.." />
                        </td>
                    </tr>
                    {items &&
                        items.map(({ id, name, modifiedTime, mimeType, size }) => (
                            <tr
                                className="border-b-2 border-gray-100 cursor-pointer hover:bg-green-50"
                                key={id}
                            >
                                <td className="text-center py-2">
                                    <Checkbox
                                        onChange={(checked) => onCheckboxSelected(id, checked)}
                                    />
                                </td>
                                <td
                                    className="overflow-hidden overflow-ellipsis whitespace-nowrap pr-4"
                                    onClick={() => action(mimeType, id, name)}
                                >
                                    <span className="mx-2 text-green-600">
                                        <Icon mimeType={mimeType} />
                                    </span>
                                    {name}
                                </td>
                                <td className="text-sm">{size ? humanFileSize(size) : ""}</td>
                                <td className="px-2 text-sm">{formatDate(modifiedTime)}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
            <div className="block sm:hidden w-full">
                <div>
                    <Spinner visible={items == null} text="Fetching.." />
                </div>
                {items &&
                    items.map(({ id, name, modifiedTime, mimeType, size }) => (
                        <div className="border-b-2 border-gray-100 flex flex-row py-2" key={id}>
                            <span className="text-center px-3">
                                <Checkbox onChange={(checked) => onCheckboxSelected(id, checked)} />
                            </span>
                            <span
                                className="overflow-hidden overflow-ellipsis px-2 text-sm"
                                onClick={() => action(mimeType, id, name)}
                            >
                                <span className="mr-2 text-green-600">
                                    <Icon mimeType={mimeType} />
                                </span>
                                {name}
                                <div className="mt-2 text-gray-400">
                                    <span>{size ? humanFileSize(size) : ""}</span>
                                    <span className="px-2">{formatDate(modifiedTime)}</span>
                                </div>
                            </span>
                        </div>
                    ))}
            </div>
        </React.Fragment>
    );
}
