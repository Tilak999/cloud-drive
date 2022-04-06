import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Text,
    Heading,
    Progress,
} from "@chakra-ui/react";
import { getTransferQueueStatus } from "@lib/uploadHandler";
import { humanFileSize } from "@lib/utils";
import { useRef, useState } from "react";

export default function ViewDetailsBtn() {
    const [isOpen, setOpen] = useState(false);
    const intervalRef = useRef<NodeJS.Timer>();
    const [progress, setProgress] = useState<any>({
        active: null,
        queue: [],
        completed: [],
    });

    const onModalOpen = () => {
        setOpen(true);
        intervalRef.current = setInterval(() => {
            const { upload_queue, completed, current_active } = getTransferQueueStatus();
            setProgress({
                active: current_active,
                queue: upload_queue,
                completed: completed,
            });
        }, 1000);
    };

    const onModalClose = () => {
        setOpen(false);
        clearInterval(intervalRef.current);
    };

    return (
        <>
            <Button variant={"link"} my="1" py="1" onClick={onModalOpen}>
                View Details
            </Button>
            <AlertDialog
                motionPreset="slideInBottom"
                onClose={onModalClose}
                isOpen={isOpen}
                isCentered
                leastDestructiveRef={undefined}
            >
                <AlertDialogOverlay />
                <AlertDialogContent>
                    <AlertDialogHeader>Activity</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody maxH={"550px"} overflowY="auto">
                        <div className="my-2">
                            <Heading size="sm" color={"gray.400"}>
                                Active
                            </Heading>
                            {progress.active ? (
                                <div className="p-2">
                                    <Text my="1">{progress.active.name}</Text>
                                    <Progress value={progress.active.percentage} max={100} my="1" />
                                    <div className="flex justify-between my-1">
                                        <div>
                                            {humanFileSize(progress.active.loaded)} /{" "}
                                            {humanFileSize(progress.active.total)}
                                        </div>
                                        <div>{progress.active.percentage.toFixed(2)}%</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2 border rounded my-4 text-center text-gray-500">
                                    No active upload
                                </div>
                            )}
                        </div>
                        <div className="my-2">
                            <Heading size="sm" color={"gray.400"}>
                                In Queue ({progress.queue.length})
                            </Heading>
                            {progress.queue.map((item) => (
                                <div className="p-2 flex justify-between">
                                    <Text my="1">{item.name}</Text>
                                    <Button
                                        variant={"link"}
                                        color="gray.500"
                                        className="hover:text-red-400"
                                        size={"sm"}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            {progress.queue.length == 0 && (
                                <div className="p-2 border rounded my-4 text-center text-gray-500">
                                    Queue empty
                                </div>
                            )}
                        </div>
                        <div className="my-2">
                            <Heading size="sm" color={"gray.400"}>
                                Uploaded ({progress.completed.length})
                            </Heading>
                            {progress.completed.map((item) => (
                                <div className="p-2">
                                    <Text my="1">{item.name}</Text>
                                </div>
                            ))}
                            {progress.completed.length == 0 && (
                                <div className="p-2 border rounded my-4 text-center text-gray-500">
                                    No recent uploads
                                </div>
                            )}
                        </div>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button onClick={onModalClose}>Close</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
