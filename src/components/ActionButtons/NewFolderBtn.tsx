import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useRef, useState } from "react";

export default function NewFolderBtn({ currentFolderId, onRefresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoading, setLoading] = useState(false);
    const input = useRef(null);
    const toast = useToast();

    const createFolder = async () => {
        const value = input.current.value;
        if (value != "") {
            setLoading(true);
            try {
                const { data } = await axios.post("/api/createFolder", {
                    directoryId: currentFolderId,
                    directoryName: value,
                });
                onRefresh(data);
                onClose();
            } catch (e) {
                const exist = (e.response.data.message as string).includes("already exist");
                toast({
                    title: exist ? "Folder with provided name already exist." : e,
                    status: "error",
                    isClosable: true,
                    position: "top",
                });
            }
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={onOpen}>New Folder</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Folder Name</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input type="text" ref={input} autoFocus={true} />
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={createFolder}
                            loadingText="Creating"
                            isLoading={isLoading}
                        >
                            Create Folder
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
