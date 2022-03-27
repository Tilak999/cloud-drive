import { useRef } from "react";

interface PropType {
    label?: string;
    onSelection: (input: { name: string; contents: string }) => void;
    className?: string;
}

export default function FileSelector({
    label,
    onSelection,
    className,
}: PropType) {
    const fileInput = useRef(null);

    const onFileSelected = async () => {
        if (fileInput.current && fileInput.current.files) {
            const file = fileInput.current.files.item(0);
            onSelection({
                name: file.name,
                contents: await file.text(),
            });
        }
    };

    return (
        <button
            type="button"
            className={className}
            onClick={() => fileInput.current.click()}
        >
            {label || "Upload File"}
            <input
                type="file"
                className="hidden"
                ref={fileInput}
                onChange={onFileSelected}
            />
        </button>
    );
}
