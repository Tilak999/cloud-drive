export default function FileListItem({ file, onClick }) {
    return (
        <div className="px-5 py-2 border-b-2 text-gray-700 border-gray-50 hover:bg-green-50 hover:text-green-700">
            <span className="mx-3 text-green-600 text-2xl align-middle">
                {file.mimeType.endsWith("folder") ? (
                    <i className="bi bi-folder-fill" />
                ) : (
                    <i className="bi bi-file-earmark-text" />
                )}
            </span>
            {file.mimeType.endsWith("folder") ? (
                <button onClick={() => onClick(file)}>{file.name}</button>
            ) : (
                <a href={file.webViewLink} target="_blank">
                    {file.name}
                </a>
            )}
        </div>
    );
}
