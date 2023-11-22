import React from "react";

export default function If({
    children,
    condition,
}: React.PropsWithChildren<{ condition: boolean | null | undefined }>) {
    return condition && children;
}
