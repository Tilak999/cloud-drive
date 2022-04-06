import { Box, Flex, VStack, Button, Text, Progress } from "@chakra-ui/react";
import { GoFileDirectory, GoFile } from "react-icons/go";
import Storage from "@components/Storage";
import { useEffect, useRef, useState } from "react";
import uploadFile, { getTransferQueueStatus } from "@lib/uploadHandler";
import ViewDetailsBtn from "./ActionButtons/ViewDetailsBtn";

declare module "react" {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        directory?: string;
        webkitdirectory?: string;
        mozdirectory?: string;
    }
}

export default function Sidebar({ directoryId }) {
    const fileInput = useRef(null);
    const folderInput = useRef(null);
    const [progress, setProgress] = useState({
        isActive: false,
        uploading: 0,
        queue: 0,
        completed: 0,
    });

    const onSelection = (e) => {
        for (const file of e.target.files) {
            uploadFile({
                file: file,
                directoryId: directoryId,
            });
        }
    };

    useEffect(() => {
        setInterval(() => {
            const { upload_queue, completed, current_active } = getTransferQueueStatus();
            setProgress({
                isActive: current_active != null,
                uploading: current_active?.percentage || 0,
                queue: upload_queue.length,
                completed: completed.length,
            });
        }, 2000);
    }, []);

    return (
        <Box>
            <Flex direction={"column"} my="4">
                <VStack>
                    <Button
                        w="full"
                        leftIcon={<GoFileDirectory />}
                        onClick={() => folderInput.current.click()}
                    >
                        Upload Folder
                    </Button>
                    <Button
                        w="full"
                        leftIcon={<GoFile />}
                        onClick={() => fileInput.current.click()}
                    >
                        Upload Files
                    </Button>
                </VStack>
            </Flex>
            <div style={{ display: "none" }}>
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
        </Box>
    );
}
