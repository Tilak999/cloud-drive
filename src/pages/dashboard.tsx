import { Flex } from "@chakra-ui/react";
import Header from "@components/Header";
import Sidebar from "@components/Sidebar";
import FileList from "@components/FileList";
import { useState } from "react";
import { useRouter } from "next/router";

export default function dashboard() {
    const [directoryId, setDirectoryId] = useState();
    const router = useRouter();

    return (
        <Flex direction="column">
            <Header />
            <Flex m="4">
                <Sidebar directoryId={directoryId} />
                <FileList folderId={router.query.id || "root"} onDirectoryChange={setDirectoryId} />
            </Flex>
        </Flex>
    );
}
