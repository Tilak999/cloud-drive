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
import axios, { AxiosError } from "axios";
import { useRef, useState } from "react";
import { FaFolderPlus } from "react-icons/fa";

interface propType {
    currentFolderId: string;
    onRefresh: (data: any) => void;
    iconOnly: boolean;
}

export default function NewFolderBtn({ currentFolderId, onRefresh, iconOnly }: propType) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoading, setLoading] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const createFolder = async () => {
        const value = input.current?.value;
        if (value != "") {
            setLoading(true);
            try {
                const { data } = await axios.post("/api/createFolder", {
                    directoryId: currentFolderId,
                    directoryName: value,
                });
                onRefresh(data);
                onClose();
            } catch (e: AxiosError | any) {
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
            <Button onClick={onOpen}>{iconOnly ? <FaFolderPlus /> : "New Folder"}</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent m="3">
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
