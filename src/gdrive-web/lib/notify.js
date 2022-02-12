const colors = {
    success: "rgb(22, 163, 74)",
    error: "rgb(255, 93, 14)",
    info: "rgb(14, 142, 255)",
    progress: "rgb(251 191 36)",
};

const icons = {
    info: `<i class="bi bi-info-circle-fill"></i>`,
    loading: `<i class="bi bi-arrow-repeat animate-spin inline-block"></i>`,
    success: `<i class="bi bi-check-circle-fill"></i>`,
};

const style =
    "position:fixed; bottom: 0; background: $color; margin: 20px; transition: all; padding: 15px; padding-right: 20px; border-radius:8px; color: white";

export default function notify(timeout) {
    const div = window.document.createElement("div");
    div.id = "alert-box";
    window.document.body.appendChild(div);
    return {
        withLoading: (message) => {
            div.style = style.replace("$color", colors.progress);
            div.innerHTML = icons.loading + "&nbsp;" + message;
            return {
                close: () => {
                    div.remove();
                },
                success: (message) => {
                    div.style = style.replace("$color", colors.success);
                    div.innerHTML = icons.success + "&nbsp;" + message;
                    setTimeout(() => {
                        div.remove();
                    }, timeout || 3000);
                },
                failed: (message) => {
                    div.style = style.replace("$color", colors.error);
                    div.innerHTML = icons.error + "&nbsp;" + message;
                    setTimeout(() => {
                        div.remove();
                    }, timeout || 3000);
                },
            };
        },
        success: (message) => {
            div.style = style.replace("$color", colors.success);
            div.innerHTML = icons.success + "&nbsp;" + message;
            setTimeout(() => {
                div.remove();
            }, timeout || 3000);
        },
    };
}
