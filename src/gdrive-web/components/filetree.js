import { File, Folder } from "./icons";

export default function FileTree(props) {
    const getId = (i) => {
        return props.id == null ? i + "" : props.id + "," + i;
    };
    return (
        <>
            {props.nodes && (
                <ul className="mx-3">
                    {props.nodes.map((node, i) => (
                        <li
                            key={i}
                            className="overflow-hidden truncate w-full mt-2"
                            title={node.name}
                        >
                            {node.mimeType.endsWith("folder") && (
                                <span className="text-gray-400 align-sub">
                                    {node.childrens?.length > 0 ? "▾" : "▸"}
                                </span>
                            )}
                            {node.mimeType.endsWith("symlink") ? (
                                <File className="inline-block align-sub mx-2 ml-3" />
                            ) : (
                                <Folder className="inline-block align-sub mx-2" />
                            )}
                            <span
                                onClick={() =>
                                    node.mimeType.endsWith("folder") &&
                                    props.onClick(getId(i))
                                }
                            >
                                {node.name}
                            </span>
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
