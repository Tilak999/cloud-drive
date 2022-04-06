import { Box, Spacer, Tooltip, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { GoFileSubmodule } from "react-icons/go";
import { VscGear } from "react-icons/vsc";

interface propType {
    index?: number;
}

export default function Header({ index }: propType) {
    const router = useRouter();

    return (
        <React.Fragment>
            <Box>
                <Button
                    leftIcon={<GoFileSubmodule />}
                    variant="ghost"
                    aria-label={"User settings"}
                    onClick={() => router.replace("/dashboard")}
                >
                    Cloud Browser
                </Button>
            </Box>
            <Spacer />
            <Box>
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
        </React.Fragment>
    );
}
