import {
    Flex,
    Box,
    Heading,
    Icon,
    Spacer,
    Tabs,
    TabList,
    Tab,
    Tooltip,
    IconButton,
    Button,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { GoFileSubmodule, GoSignOut } from "react-icons/go";
import { VscGear } from "react-icons/vsc";

interface propType {
    index?: number;
}

export default function Header({ index }: propType) {
    const router = useRouter();

    return (
        <Flex borderBottom={"1px"} borderColor={"whiteAlpha.400"} p="2">
            <Box>
                <Button leftIcon={<GoFileSubmodule />} variant="ghost" aria-label={"User settings"}>
                    Cloud Browser
                </Button>
            </Box>
            <Spacer />
            <Box>
                <Tooltip label="User settings">
                    <Button leftIcon={<VscGear />} variant="ghost" aria-label={"User settings"}>
                        Account
                    </Button>
                </Tooltip>
                <Button variant="ghost">Logout</Button>
            </Box>
        </Flex>
    );
}
