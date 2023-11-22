import { File } from "@/types/file";
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
import { useState } from "react";
import { BiRename } from "react-icons/bi";

interface propType {
    file: File;
    onRefresh: (data: any) => void;
    iconOnly: boolean;
}

export default function RenameBtn({ file, onRefresh, iconOnly }: propType) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState(file.name);
    const toast = useToast();

    const createFolder = async () => {
        if (name != "") {
            setLoading(true);
            try {
                const { data } = await axios.post("/api/rename", {
                    id: file.id,
                    name: name,
                });
                onClose();
                onRefresh(data);
            } catch (e: AxiosError | any) {
                toast({
                    title: e.response.data.errorMsg,
                    isClosable: true,
                    status: "error",
                });
            }
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={onOpen}>{iconOnly ? <BiRename /> : "Rename"}</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent m="3">
                    <ModalHeader>New Name</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input
                            type="text"
                            value={name}
                            autoFocus={true}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={createFolder}
                            loadingText="Updating"
                            isLoading={isLoading}
                        >
                            Update
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
