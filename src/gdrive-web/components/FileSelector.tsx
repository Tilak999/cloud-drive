import { useRef } from "react";

interface PropType {
    text?: string,
    onSelection: () => { name: string, text: string },
    className?: string
}

export default function FileSelector({ text, onSelection, className }:PropType) {
    const fileInput = useRef(null);

    const onFileSelected = async () => {
        if (fileInput.current && fileInput.current.files) {
            const file = fileInput.current.files.item(0);
            onSelection({
                name: file.name,
                text: await file.text(),
            });
        }
    };

    return <button
        type="button"
        className={className}
        onClick={() => fileInput.current.click()}>
        { text || "Upload File" }
        <input
            type="file"
            className="hidden"
            ref={fileInput}
            onChange={onFileSelected}
        />
    </button>
}