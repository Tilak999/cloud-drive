import { File, Folder } from "./icons";
import Spinner from "./spinner";

export default function FileTree(props) {
    const getId = (i) => {
        return props.id == null ? i + "" : props.id + "," + i;
    };

    const toggle = (mimeType, id) => {
        mimeType.endsWith("folder") && props.onExpandFolder(id);
    };

    const onFolderSelection = (node) => {
        node.mimeType.endsWith("folder") && props.onFolderSelection(node);
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
                                <span
                                    className="mr-3 hover:text-green-600 hover:cursor-pointer"
                                    onClick={() =>
                                        toggle(node.mimeType, getId(i))
                                    }
                                >
                                    {node.childrens?.length > 0 ? (
                                        <i className="bi bi-chevron-down" />
                                    ) : (
                                        <i className="bi bi-chevron-right" />
                                    )}
                                </span>
                            )}
                            {node.mimeType.endsWith("symlink") ? (
                                <i className="ml-7 bi bi-file-earmark-text"></i>
                            ) : (
                                <i className="bi bi-folder2"></i>
                            )}
                            <span
                                className="mx-1 hover:text-green-600 hover:cursor-pointer"
                                onClick={() => onFolderSelection(node)}
                            >
                                {node.name}
                            </span>
                            <div className="ml-7 my-2 text-sm text-green-500">
                                {node.loading && (
                                    <Spinner
                                        visible={true}
                                        text="Fetching"
                                        compact
                                    />
                                )}
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
