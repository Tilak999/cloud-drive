import {
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Checkbox,
    Tbody,
    Td,
    Spinner,
    Center,
} from "@chakra-ui/react";
import { onUpdate } from "@lib/uploadHandler";
import { formatDate, humanFileSize } from "@lib/utils";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FileIcon from "./FileIcons";
import FileListHeader from "./FileListHeader";

export default function FileList({ folderId, onDirectoryChange }) {
    const [data, setData] = useState({ name: "", files: [] });
    const [selection, setSelection] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setSelection([]);
        loadFiles(folderId);
        onUpdate((lastCompleted) => {
            if (lastCompleted.directoryId == folderId) {
                loadFiles(folderId, true);
            }
        });
    }, [folderId]);

    const selectAll = (e) => {
        if (e.target.checked) {
            setSelection(data.files);
        } else {
            setSelection([]);
        }
    };

    const loadFiles = async (folderId, silent = false) => {
        if (!silent) setLoading(true);
        onDirectoryChange(folderId);
        const { data } = await axios.post("/api/listFiles", { folderId });
        setData(data);
        setLoading(false);
    };

    const checkbox = (e, f) => {
        if (e.target.checked) {
            setSelection([...selection, f]);
        } else {
            setSelection(selection.filter((s) => s.id != f.id));
        }
    };

    const reset = () => {
        setSelection([]);
        loadFiles(folderId);
    };

    return (
        <TableContainer w="full" mx="6">
            <FileListHeader
                title={data.name}
                selection={selection}
                folderId={folderId}
                onRefresh={reset}
            />
            {isLoading && (
                <Center py="4">
                    <Spinner />
                </Center>
            )}
            <Table variant="simple" display={isLoading ? "none" : "table"}>
                <Thead>
                    <Tr>
                        <Th w="8">
                            <Checkbox colorScheme={"gray"} size={"lg"} onChange={selectAll} />
                        </Th>
                        <Th>Name</Th>
                        <Th w="28">Date</Th>
                        <Th w="28">Size</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.files.map((f) => {
                        return (
                            <Tr key={f.id + f.modifiedTime} _hover={{ background: "gray.700" }}>
                                <Td>
                                    <Checkbox
                                        isChecked={selection.findIndex((i) => i.id == f.id) > -1}
                                        colorScheme={"gray"}
                                        size={"lg"}
                                        onChange={(e) => checkbox(e, f)}
                                    />
                                </Td>
                                <Td
                                    onClick={() => {
                                        router.push("/dashboard?id=" + f.id);
                                    }}
                                    cursor="pointer"
                                >
                                    <FileIcon mimeType={f.mimeType} filename={f.name} />
                                    <span style={{ marginLeft: "10px" }}>{f.name}</span>
                                </Td>
                                <Td>{formatDate(f.modifiedTime)}</Td>
                                <Td>{f.size && humanFileSize(f.size)}</Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    );
}
