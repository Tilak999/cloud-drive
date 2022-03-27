export default function Icon({ mimeType }) {
    return mimeType.endsWith("folder") ? (
        <i className="bi bi-folder-fill" />
    ) : (
        <i className="bi bi-file-earmark-text" />
    );
}
