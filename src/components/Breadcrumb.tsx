import Link from "next/link";
import React from "react";

export default function Breadcrumb({ chunks }) {
    const getUrl = (item) => {
        let path = "";
        for (const chunk of chunks) {
            const [name, id] = item.split(":");
            path += (path && "/") + chunk;
            if (chunk == item) {
                return `/dashboard?folderId=${id || ""}&path=${path}`;
            }
        }
    };

    return (
        <>
            {chunks.map((item, i) => (
                <React.Fragment key={item}>
                    <Link href={getUrl(item)}>
                        <span className="text-green-700 hover:text-green-900 cursor-pointer underline">
                            {item.split(":")[0]}
                        </span>
                    </Link>
                    {i < chunks.length - 1 && <span className="px-2">/</span>}
                </React.Fragment>
            ))}
        </>
    );
}
