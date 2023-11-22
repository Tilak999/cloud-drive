import If from "@/components/If";
import {
    clearCompleted,
    clearFailed,
    getTransferQueueStatus,
    removeFromQueue,
    retryUpload,
} from "@/lib/uploadHandler";
import { humanFileSize } from "@/lib/utils";
import { ICurrentFileProgress, IUploadFileObject } from "@/types/uploadHandler";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Heading,
    Progress,
    Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";

interface IProgress {
    active: ICurrentFileProgress | null;
    queue: IUploadFileObject[];
    completed: ICurrentFileProgress[];
    failed: IUploadFileObject[];
}

export default function ViewDetailsBtn() {
    const [isOpen, setOpen] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout>();
    const [progress, setProgress] = useState<IProgress>();

    const onModalOpen = () => {
        setOpen(true);
        intervalRef.current = setInterval(() => {
            const { upload_queue, completed, current_active, failed } = getTransferQueueStatus();
            setProgress({
                active: current_active,
                queue: upload_queue,
                completed: completed,
                failed: failed,
            });
        }, 1000);
    };

    const onModalClose = () => {
        setOpen(false);
        clearInterval(intervalRef.current);
    };

    const getProgress = () => {
        if (progress?.active?.loaded && progress?.active?.total)
            return (
                humanFileSize(progress.active.loaded) + "/" + humanFileSize(progress.active.total)
            );
        return "";
    };

    const getProgressPercent = () => {
        if (progress && progress?.active?.percentage) return progress.active.percentage.toFixed(2);
        else return 0;
    };

    return (
        <>
            <Button variant={"link"} my="1" py="1" size={"sm"} onClick={onModalOpen}>
                View Details
            </Button>
            <AlertDialog
                motionPreset="slideInBottom"
                onClose={onModalClose}
                isOpen={isOpen}
                isCentered
                size="2xl"
                leastDestructiveRef={null as any}
            >
                <AlertDialogOverlay />
                <AlertDialogContent>
                    <AlertDialogHeader>Activity</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody maxH={"550px"} overflowY="auto">
                        <div className="my-2 cursor-default">
                            <Heading size="sm" color={"gray.400"}>
                                Active
                            </Heading>
                            {progress && progress.active ? (
                                <div className="p-2">
                                    <Text my="2" size="sm">
                                        {progress.active.name}
                                    </Text>
                                    <Progress value={progress.active.percentage} max={100} my="2" />
                                    <div className="flex justify-between my-2 text-sm text-gray-400">
                                        <div>{getProgress()}</div>
                                        <div>{getProgressPercent()}%</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2 border rounded my-4 text-center text-gray-500">
                                    No active upload
                                </div>
                            )}
                        </div>
                        <div className="my-2 cursor-default">
                            <Heading size="sm" color={"gray.400"} mb="2">
                                In Queue ({progress && progress.queue.length})
                            </Heading>
                            {progress &&
                                progress.queue.map((item) => (
                                    <div
                                        key={item.directoryId}
                                        className="m-1 flex justify-between"
                                    >
                                        <Text my="1" color="gray.300" size="sm">
                                            {item.name}
                                        </Text>
                                        <Button
                                            variant={"link"}
                                            color="gray.500"
                                            className="hover:text-red-400"
                                            size={"sm"}
                                            onClick={() =>
                                                removeFromQueue(item.name, item.directoryId)
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            {progress && progress.queue.length == 0 && (
                                <div className="p-2 border rounded my-4 text-center text-gray-500">
                                    Queue empty
                                </div>
                            )}
                        </div>
                        <If condition={progress && progress.completed.length > 0}>
                            <div className="my-2 cursor-default">
                                <Heading
                                    size="sm"
                                    className="flex justify-between"
                                    color={"gray.400"}
                                    mb="2"
                                >
                                    Uploaded ({progress && progress.completed.length})
                                    <Button
                                        variant={"link"}
                                        color="gray.500"
                                        className="hover:text-red-400 mr-2"
                                        size={"sm"}
                                        onClick={clearCompleted}
                                    >
                                        Clear completed
                                    </Button>
                                </Heading>
                                {progress &&
                                    progress.completed.map((item) => (
                                        <div key={item.directoryId} className="p-1">
                                            <Text my="1" color="gray.300" size="sm">
                                                {item.name}
                                            </Text>
                                        </div>
                                    ))}
                                {progress && progress.completed.length == 0 && (
                                    <div className="p-2 border rounded my-4 text-center text-gray-500">
                                        No recent uploads
                                    </div>
                                )}
                            </div>
                        </If>

                        <If condition={progress && progress.failed.length > 0}>
                            <div className="my-2 cursor-default">
                                <Heading
                                    size="sm"
                                    className="flex justify-between"
                                    color={"gray.400"}
                                    mb="2"
                                >
                                    Failed ({progress && progress.failed.length})
                                    <Button
                                        variant={"link"}
                                        color="gray.500"
                                        className="hover:text-red-400 mr-2"
                                        size={"sm"}
                                        onClick={clearFailed}
                                    >
                                        Clear failed
                                    </Button>
                                </Heading>
                                {progress &&
                                    progress.failed.map((item) => (
                                        <div
                                            key={item.directoryId}
                                            className="m-1 flex justify-between"
                                        >
                                            <Text my="1" color="gray.300" size="sm">
                                                {item.name}
                                            </Text>
                                            <Button
                                                variant={"link"}
                                                color="gray.500"
                                                className="hover:text-white"
                                                size={"sm"}
                                                onClick={() => retryUpload(item)}
                                            >
                                                Retry
                                            </Button>
                                        </div>
                                    ))}
                                {progress && progress.failed.length == 0 && (
                                    <div className="p-2 border rounded my-4 text-center text-gray-500">
                                        No recent uploads
                                    </div>
                                )}
                            </div>
                        </If>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button onClick={onModalClose}>Close</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
