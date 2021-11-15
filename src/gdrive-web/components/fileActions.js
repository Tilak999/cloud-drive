export default function FileActions(props) {
    const btnGroup = [
        [
            {
                icon: "bi-folder-plus",
                tip: "Create New Folder",
            },
            { icon: "bi-scissors", tip: "Cut File or Folder" },
            { icon: "bi-trash", tip: "Delete File or Folder" },
        ],
        [
            { icon: "bi-arrow-bar-up", text: "Upload" },
            { icon: "bi-cloud-arrow-down", text: "Download" },
        ],
    ];

    const isDisabled = () => {
        if (props.disableAll) return true;
    };

    return (
        <>
            {btnGroup.map((buttons) => (
                <span className="mx-2">
                    {buttons.map((btn) => (
                        <button
                            className={`px-3 mr-1 py-1 rounded bg-gray-50 hover:bg-green-50 hover:text-green-700 ${
                                btn.disabled ? "opacity-40" : ""
                            }`}
                            disabled={btn.disabled}
                            title={btn.tip || btn.text}
                        >
                            <i className={`bi ${btn.icon}`}></i>
                            {btn.text && (
                                <span className="mx-2">{btn.text}</span>
                            )}
                        </button>
                    ))}
                </span>
            ))}
        </>
    );
}
