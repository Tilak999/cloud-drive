import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Box,
    Icon,
    Table,
    TableContainer,
    Tbody,
    Td,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { GoFileDirectory, GoFileSymlinkDirectory } from "react-icons/go";

function FileList({ data, onSelect }) {
    const style = {
        background: "gray.800",
    };
    return (
        <TableContainer w="full">
            <Table variant="simple">
                <Tbody>
                    {data.parents && (
                        <Tr _hover={style}>
                            <Td onClick={() => onSelect(data.parents[0])} cursor="pointer">
                                <Icon as={GoFileDirectory} boxSize="6" verticalAlign={"bottom"} />
                                <span style={{ marginLeft: "10px" }}>..</span>
                            </Td>
                        </Tr>
                    )}
                    {data.files.map((f) => {
                        return (
                            <Tr key={f.id + f.modifiedTime} _hover={style}>
                                <Td onClick={() => onSelect(f.id)} cursor="pointer">
                                    <Icon
                                        as={GoFileDirectory}
                                        boxSize="6"
                                        verticalAlign={"bottom"}
                                    />
                                    <span style={{ marginLeft: "10px" }}>{f.name}</span>
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    );
}

export default function MoveBtn({ selection, onRefresh, iconOnly }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();

    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState({ id: "", files: [], name: "" });

    const loadFiles = async (folderId) => {
        if (isLoading) return;
        setLoading(true);
        const { data } = await axios.post("/api/listFiles", { folderId });
        const selectedIds = selection.map((f) => f.id);
        data.files = data.files.filter((f) => !selectedIds.includes(f.id));
        setData(data);
        setLoading(false);
    };

    const move = async () => {
        setLoading(true);
        await axios.post("/api/move", {
            sourceIds: selection.map((f) => f.id),
            destinationId: data.id,
        });
        setLoading(false);
        onClose();
        onRefresh();
    };

    useEffect(() => {
        loadFiles("root");
    }, [isOpen]);

    return (
        <>
            <Button onClick={onOpen}>{iconOnly ? <GoFileSymlinkDirectory /> : "Delete"}</Button>
            <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isOpen={isOpen}
                isCentered
            >
                <AlertDialogOverlay />
                <AlertDialogContent m="3">
                    <AlertDialogHeader>Select Folder</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody px="0" maxH={"450px"} overflowY="auto">
                        <Box px="6" py="2" fontSize={"sm"} color="gray.300">
                            Currently selected: {data.name}
                        </Box>
                        <FileList data={data} onSelect={loadFiles} />
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button ml={3} onClick={move} isLoading={isLoading}>
                            Move
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
