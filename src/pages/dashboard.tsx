import {
    Box,
    Flex,
    Heading,
    Spacer,
    Tabs,
    TabList,
    Tab,
    IconButton,
    Table,
    Text,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Checkbox,
    Tooltip,
    Button,
    VStack,
    Progress,
    Input,
    HStack,
} from "@chakra-ui/react";
import Icon from "@chakra-ui/Icon";
import { GoSignOut, GoFileDirectory, GoFileSubmodule, GoFile } from "react-icons/go";

export default function dashboard() {
    return (
        <Flex direction="column">
            <Flex pt="2" borderBottom={"1px"} borderColor={"whiteAlpha.400"}>
                <Box my="2" mx="4">
                    <Heading size="sm">
                        <Icon as={GoFileSubmodule}></Icon>&nbsp; Cloud Browser
                    </Heading>
                </Box>
                <Spacer />
                <Box>
                    <Tabs colorScheme="white">
                        <TabList>
                            <Tab>Home</Tab>
                            <Tab>Uploads</Tab>
                            <Tab>Account</Tab>
                        </TabList>
                    </Tabs>
                </Box>
                <Tooltip label="Sign out">
                    <IconButton
                        icon={<GoSignOut />}
                        variant="link"
                        mx="4"
                        aria-label={"sign out"}
                    />
                </Tooltip>
            </Flex>
            <Flex m="4">
                <Box w="18em">
                    <Flex direction={"column"} my="4">
                        <VStack>
                            <Button w="full" leftIcon={<GoFileDirectory />}>
                                Upload Folder
                            </Button>
                            <Button w="full" leftIcon={<GoFile />}>
                                Upload Files
                            </Button>
                        </VStack>
                    </Flex>
                    <Box bgColor={"gray.700"} rounded="md" h="40" p="4">
                        <Text>Storage</Text>
                        <Progress my="4" colorScheme="gray" size="sm" value={40} />
                        <Text fontSize={"sm"} color="gray.400" py="1">
                            Free Space: 600 GB
                        </Text>
                        <Text fontSize={"sm"} color="gray.400" py="1">
                            Total Space: 1.48 TB
                        </Text>
                    </Box>
                </Box>
                <TableContainer w="full" mx="6">
                    <Flex>
                        <Box pl="5" py="4">
                            <Heading
                                size={"md"}
                                maxW="md"
                                textOverflow={"ellipsis"}
                                overflow="hidden"
                            >
                                Home-this-is-a-very-big-tittle-and-i-wont-know-about-it-still-longgg-umm-ok-ok-ok-jimmy
                            </Heading>
                        </Box>
                        <Spacer />
                        <Box my="2" mx="1" borderRight={"1px"} borderColor="gray.600">
                            <HStack px="3">
                                <Input variant="filled" placeholder="Search" display={"none"} />
                                <Button>Move</Button>
                                <Button>Rename</Button>
                                <Button>Delete</Button>
                            </HStack>
                        </Box>
                        <Box mx="2" my="2">
                            <Button>New Folder</Button>
                            <IconButton icon={<GoFile />} mx="2" aria-label={"reload"} />
                        </Box>
                    </Flex>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th w="8">
                                    <Checkbox colorScheme={"gray"} size={"lg"} />
                                </Th>
                                <Th>Name</Th>
                                <Th w="28">Date</Th>
                                <Th w="28">Size</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>
                                    <Checkbox colorScheme={"gray"} size={"lg"} />
                                </Td>
                                <Td>
                                    <Icon
                                        as={GoFileDirectory}
                                        boxSize="6"
                                        verticalAlign={"bottom"}
                                    />
                                    <span style={{ marginLeft: "10px" }}>Movies</span>
                                </Td>
                                <Td>16 Apr, 2022</Td>
                                <Td></Td>
                            </Tr>
                            <Tr>
                                <Td></Td>
                                <Td>Docs</Td>
                                <Td>16 Apr, 2022</Td>
                                <Td></Td>
                            </Tr>
                            <Tr>
                                <Td></Td>
                                <Td>Series</Td>
                                <Td>16 Apr, 2022</Td>
                                <Td></Td>
                            </Tr>
                            <Tr>
                                <Td></Td>
                                <Td>Meta.js</Td>
                                <Td>16 Apr, 2022</Td>
                                <Td>20 KB</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            </Flex>
        </Flex>
    );
}
