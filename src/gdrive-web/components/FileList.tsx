import { useState } from "react";
import { humanFileSize } from "@dist/lib/utils";

function getDate(dateStr) {
    const date = new Date(dateStr);
    return (
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
        " " +
        date.toLocaleString("default", { month: "short" }) +
        ", " +
        date.getFullYear()
    );
}

function getIcon(mimeType) {
    return mimeType.endsWith("folder") ? (
        <i className="bi bi-folder-fill" />
    ) : (
        <i className="bi bi-file-earmark-text" />
    );
}

function Checkbox({ onChange }) {
    const [checked, setChecked] = useState(false);
    return (
        <i
            className={"bi " + (checked ? "bi-check-square-fill" : "bi-square")}
            onClick={() => {
                console.log(checked);
                onChange(!checked);
                setChecked(!checked);
            }}
        ></i>
    );
}

export default function FileList({ directory, onClick, onSelection }) {
    const [selectedItems, setSelection] = useState([]);

    const onChange = (path, selected) => {
        let arr;
        if (selected) arr = [...selectedItems, path];
        else arr = [...selectedItems.filter((val) => val != path)];
        setSelection(arr);
        onSelection(arr);
    };

    return (
        <table className="border-collapse w-full table-fixed">
            <thead className="border-b-2 border-gray-100 bg-gray-50">
                <tr className="text-left font-semibold">
                    <th className="w-16 py-1"></th>
                    <th className="py-1">Name</th>
                    <th className="py-1 w-28">Size</th>
                    <th className="py-1 w-40">Create Date</th>
                </tr>
            </thead>
            <tbody className="text-gray-600">
                {directory.childrens.map(
                    ({ name, fileSize, modifiedTime, path, mimeType }) => (
                        <tr
                            className="border-b-2 border-gray-100 cursor-pointer hover:bg-green-50"
                            key={name}
                        >
                            <td className="text-center py-2">
                                <Checkbox onChange={(v) => onChange(path, v)} />
                            </td>
                            <td
                                className="overflow-hidden overflow-ellipsis whitespace-nowrap pr-4"
                                onClick={() =>
                                    onClick({ path, name, mimeType })
                                }
                            >
                                <span className="mx-2 text-green-600">
                                    {getIcon(mimeType)}
                                </span>
                                {name}
                            </td>
                            <td className="text-sm">
                                {fileSize ? humanFileSize(fileSize) : ""}
                            </td>
                            <td className="px-2 text-sm">
                                {getDate(modifiedTime)}
                            </td>
                        </tr>
                    )
                )}
            </tbody>
        </table>
    );
}
