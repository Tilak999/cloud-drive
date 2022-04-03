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
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";

export default function RenameBtn({ file, onRefresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState(file.name);

    const createFolder = async () => {
        if (name != "") {
            setLoading(true);
            const { data } = await axios.post("/api/rename", {
                id: file.id,
                name: name,
            });
            setLoading(false);
            onClose();
            onRefresh(data);
        }
    };

    return (
        <>
            <Button onClick={onOpen}>Rename</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
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
