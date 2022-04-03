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

export default function DeleteFileBtn({ selection, onRefresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
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
            <Button onClick={onOpen}>Delete</Button>
            <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isOpen={isOpen}
                isCentered
            >
                <AlertDialogOverlay />

                <AlertDialogContent>
                    <AlertDialogHeader>Confirm Delete</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody>
                        Are you sure you want to delete {selection.length} Items.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
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
