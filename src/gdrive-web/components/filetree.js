import { File, Folder } from "./icons";

export default function FileTree(props) {
    const getId = (i) => {
        return props.id == null ? i + "" : props.id + "," + i;
    };

    const sendEvent = (mimeType, id) => {
        mimeType.endsWith("folder") && props.onClick(id);
    };

    return (
        <>
            {props.nodes && (
                <ul className="mx-3">
                    {props.nodes.map((node, i) => (
                        <li
                            key={i}
                            className="whitespace-nowrap w-full mt-2"
                            title={node.name}
                        >
                            {node.mimeType.endsWith("folder") && (
                                <span className="text-gray-400 align-sub">
                                    {node.childrens?.length > 0 ? "▾" : "▸"}
                                </span>
                            )}
                            {node.mimeType.endsWith("symlink") ? (
                                <File className="inline-block align-sub mx-2 ml-6" />
                            ) : (
                                <Folder className="inline-block align-sub mx-2" />
                            )}
                            <span
                                className="font-semibold"
                                onClick={() =>
                                    sendEvent(node.mimeType, getId(i))
                                }
                            >
                                {node.name}
                            </span>
                            <div className="ml-5 text-sm text-green-500">
                                {node.loading && "Loading.."}
                            </div>
                            <FileTree
                                {...props}
                                nodes={node.childrens}
                                id={getId(i)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
