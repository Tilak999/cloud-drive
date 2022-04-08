import {
    Box,
    Button,
    Drawer,
    DrawerCloseButton,
    DrawerContent,
    DrawerOverlay,
    IconButton,
    Spacer,
    useBreakpointValue,
    useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { GoFileSubmodule } from "react-icons/go";
import { VscArrowLeft, VscGear } from "react-icons/vsc";
import Sidebar from "./Sidebar";

interface propType {
    index?: number;
}

export default function Header({ index }: propType) {
    const router = useRouter();
    const breakpt = useBreakpointValue({ base: "base", md: "md" });
    const { isOpen, onOpen, onClose } = useDisclosure();

    const action = () => {
        if (breakpt == "md") router.replace("/dashboard");
        else if (router.query.id) router.back();
    };

    return (
        <React.Fragment>
            <Box>
                <Button
                    leftIcon={breakpt == "md" ? <GoFileSubmodule /> : <VscArrowLeft />}
                    variant="ghost"
                    aria-label={"User settings"}
                    onClick={action}
                >
                    Cloud Browser
                </Button>
            </Box>
            <Spacer />
            <Box display={breakpt == "md" ? "block" : "none"}>
                <Button leftIcon={<VscGear />} variant="ghost" aria-label={"User settings"}>
                    Account
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => {
                        window.location.href = "/api/logout";
                    }}
                >
                    Logout
                </Button>
            </Box>
            <Box display={breakpt == "md" ? "none" : "block"}>
                <IconButton icon={<VscGear />} aria-label={"menu"} onClick={onOpen} />
                <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                    <DrawerOverlay />
                    <DrawerContent bgColor={"gray.900"} p="4">
                        <DrawerCloseButton />
                        <div className="pt-5">
                            <Sidebar directoryId={"root"} />
                        </div>
                    </DrawerContent>
                </Drawer>
            </Box>
        </React.Fragment>
    );
}
