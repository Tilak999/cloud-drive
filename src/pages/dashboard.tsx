import Header from "@components/Header";
import Sidebar from "@components/Sidebar";
import FileList from "@components/FileList";
import { useState } from "react";
import { useRouter } from "next/router";
import { useBreakpointValue } from "@chakra-ui/react";

export default function dashboard() {
    const [directoryId, setDirectoryId] = useState();
    const router = useRouter();
    const breakpt = useBreakpointValue({ base: "base", md: "md" });

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex flex-none p-3 border-b border-grey">
                <Header />
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex h-full">
                    {breakpt == "md" && (
                        <div className="w-72 h-full px-3 overflow-y-auto">
                            <Sidebar directoryId={directoryId} />
                        </div>
                    )}
                    <div className="flex flex-col flex-1 h-full overflow-y-auto">
                        <FileList
                            folderId={router.query.id || "root"}
                            onDirectoryChange={setDirectoryId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
