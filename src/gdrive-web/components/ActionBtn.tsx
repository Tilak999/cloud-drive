const btnGroup = {
    createFolder: {
        icon: "bi-folder-plus",
        tip: "Create New Folder",
        action: "new_folder",
        text: null,
    },
    move: {
        icon: "bi-folder-symlink",
        tip: "Move File or Folder",
        action: "move",
        text: null,
    },
    rename: {
        icon: "bi-cursor-text",
        tip: "Rename File or Folder",
        action: "rename",
        text: null,
    },
    delete: {
        icon: "bi-trash",
        tip: "Delete File or Folder",
        action: "trash",
        text: null,
    },
    upload: {
        icon: "bi-arrow-bar-up",
        text: "Upload",
        action: "upload",
        tip: "upload",
    },
};

type ButtonType = "createFolder" | "move" | "delete" | "upload" | "rename";

interface propType {
    disabled?: boolean;
    type: ButtonType;
    onClick: (e: any) => void;
}

export default function ActionBtn({ disabled, type, onClick }: propType) {
    const hint = btnGroup[type].tip || btnGroup[type].text;
    return (
        <>
            <button
                className={`px-3 mr-1 py-1 rounded bg-gray-50 hover:bg-green-50 hover:text-green-700 ${
                    disabled ? "opacity-40" : ""
                }`}
                disabled={disabled}
                title={hint}
                onClick={onClick}
            >
                <i className={`bi ${btnGroup[type].icon}`}></i>
                {btnGroup[type].text && (
                    <span className="mx-2">{btnGroup[type].text}</span>
                )}
            </button>
        </>
    );
}
