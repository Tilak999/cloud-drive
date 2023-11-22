import Storage from "@/components/Storage";
import uploadFile, { getTransferQueueStatus } from "@/lib/uploadHandler";
import {
    Box,
    Button,
    Flex,
    Progress,
    Text,
    useBreakpointValue,
    useInterval,
    VStack,
} from "@chakra-ui/react";
import React, { ChangeEventHandler, useRef, useState } from "react";
import { GoFile, GoFileDirectory } from "react-icons/go";
import ViewDetailsBtn from "./ActionButtons/ViewDetailsBtn";
import If from "./If";

declare module "react" {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        directory?: string;
        webkitdirectory?: string;
        mozdirectory?: string;
    }
}

export default function Sidebar({ directoryId }: { directoryId: string }) {
    const fileInput = useRef<HTMLInputElement>(null);
    const folderInput = useRef<HTMLInputElement>(null);
    const breakPt = useBreakpointValue({ base: "base", md: "md" });

    const [progress, setProgress] = useState({
        isActive: false,
        uploading: 0,
        queue: 0,
        completed: 0,
        failed: 0,
    });

    const onSelection: ChangeEventHandler = (e: React.ChangeEvent<HTMLFormElement>) => {
        for (const file of e.target.files) {
            uploadFile({
                name: file.name,
                file: file,
                directoryId: directoryId,
            });
        }
    };

    useInterval(() => {
        const { upload_queue, completed, current_active, failed } = getTransferQueueStatus();
        setProgress({
            isActive: current_active != null,
            uploading: current_active?.percentage || 0,
            queue: upload_queue.length,
            completed: completed.length,
            failed: failed.length,
        });
    }, 2000);

    return (
        <Box>
            <Flex direction={"column"} my="4">
                <VStack>
                    <Button
                        w="full"
                        leftIcon={<GoFileDirectory />}
                        onClick={() => folderInput.current?.click()}
                    >
                        Upload Folder
                    </Button>
                    <Button
                        w="full"
                        leftIcon={<GoFile />}
                        onClick={() => fileInput.current?.click()}
                    >
                        Upload Files
                    </Button>
                </VStack>
            </Flex>
            <div className="hidden">
                <input type="file" multiple ref={fileInput} onChange={onSelection} />
                <input
                    type="file"
                    webkitdirectory=""
                    mozdirectory=""
                    ref={folderInput}
                    onChange={onSelection}
                />
            </div>
            <Storage />

            <Box bgColor={"gray.700"} rounded="md" p="4" my="4">
                <Text>Upload Activity</Text>
                <Progress my="4" colorScheme="gray" size="sm" value={progress.uploading} />
                <Text fontSize={"sm"} color="gray.400" py="1">
                    File in Queue: {progress.queue}
                </Text>
                <Text fontSize={"sm"} color="gray.400" py="1">
                    Upload Completed: {progress.completed}
                </Text>
                <ViewDetailsBtn />
            </Box>

            <If condition={breakPt == "base"}>
                <Button
                    variant="solid"
                    w="full"
                    onClick={() => {
                        window.location.href = "/api/logout";
                    }}
                >
                    Logout
                </Button>
            </If>
        </Box>
    );
}
