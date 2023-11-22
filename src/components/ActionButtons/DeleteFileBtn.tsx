import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useRef, useState } from "react";
import { GoTrash } from "react-icons/go";

interface propType {
    selection: { id: String }[];
    onRefresh: () => void;
    iconOnly: boolean;
}

export default function DeleteFileBtn({ selection, onRefresh, iconOnly }: propType) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [isLoading, setLoading] = useState(false);

    const deleteItems = async () => {
        setLoading(true);
        await axios.post("/api/deleteObjects", {
            ids: selection.map((f) => f.id),
        });
        setLoading(false);
        onClose();
        onRefresh();
    };

    return (
        <>
            <Button onClick={onOpen} colorScheme="orange">
                {iconOnly ? <GoTrash /> : "Delete"}
            </Button>
            <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isOpen={isOpen}
                isCentered
            >
                <AlertDialogOverlay />
                <AlertDialogContent m="3">
                    <AlertDialogHeader>Confirm Delete</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody>
                        Are you sure you want to delete {selection.length} Items.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose} disabled={isLoading}>
                            No
                        </Button>
                        <Button
                            colorScheme="red"
                            ml={3}
                            onClick={deleteItems}
                            isLoading={isLoading}
                        >
                            Yes
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
