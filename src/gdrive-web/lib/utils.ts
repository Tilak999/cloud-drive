export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return (
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
        " " +
        date.toLocaleString("default", { month: "short" }) +
        ", " +
        date.getFullYear()
    );
}
