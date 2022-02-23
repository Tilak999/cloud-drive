const btnGroup = {
    createFolder: {
        icon: "bi-folder-plus",
        tip: "Create New Folder",
        action: "new_folder",
    },
    cut: { icon: "bi-scissors", tip: "Cut File or Folder", action: "cut" },
    delete: { icon: "bi-trash", tip: "Delete File or Folder", action: "trash" },
    upload: { icon: "bi-arrow-bar-up", text: "Upload", action: "upload" },
};

interface propType {
    disabled?: boolean;
    type: any;
    onClick: (e: any) => void;
}

export default function FileActionBtn({ disabled, type, onClick }: propType) {
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
