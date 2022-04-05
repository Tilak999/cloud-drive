import { Flex, Box, Heading, Spacer, HStack, Input, IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { GoSync } from "react-icons/go";
import { VscArrowLeft } from "react-icons/vsc";
import DeleteFileBtn from "./ActionButtons/DeleteFileBtn";
import MoveBtn from "./ActionButtons/MoveBtn";
import NewFolderBtn from "./ActionButtons/NewFolderBtn";
import RenameBtn from "./ActionButtons/RenameBtn";

export default function FileListHeader({ title, selection, folderId, onRefresh }) {
    const router = useRouter();
    return (
        <Flex my="2">
            <Box pl="3" my="2">
                <Heading size={"md"} maxW="md" textOverflow={"ellipsis"} overflow="hidden">
                    {folderId != "root" && (
                        <IconButton
                            icon={<VscArrowLeft />}
                            aria-label={"back"}
                            variant="ghost"
                            onClick={() => router.back()}
                            mr="4"
                        />
                    )}
                    {title}
                </Heading>
            </Box>
            <Spacer />
            <Box my="2" mx="1" borderRight={"1px"} borderColor="gray.600">
                <HStack px="3">
                    {selection.length == 0 ? (
                        <Input variant="filled" placeholder="Search" />
                    ) : (
                        <>
                            <MoveBtn selection={selection} onRefresh={onRefresh} />
                            {selection.length == 1 && (
                                <RenameBtn file={selection[0]} onRefresh={onRefresh} />
                            )}
                            <DeleteFileBtn selection={selection} onRefresh={onRefresh} />
                        </>
                    )}
                </HStack>
            </Box>
            <Box mx="2" my="2">
                <NewFolderBtn currentFolderId={folderId} onRefresh={onRefresh} />
                <IconButton icon={<GoSync />} mx="2" aria-label={"reload"} onClick={onRefresh} />
            </Box>
        </Flex>
    );
}
