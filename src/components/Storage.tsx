import { Box, Progress, Text } from "@chakra-ui/react";
import { humanFileSize } from "@lib/utils";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Storage() {
    const [storage, setStorage] = useState({
        limit: "~",
        usage: "~",
        free: "~",
        percentage: 0,
    });

    useEffect(() => {
        axios.get("/api/storageInfo").then(({ data }) => {
            const free = humanFileSize(data.limit - data.usage);
            const limit = humanFileSize(data.limit);
            const usage = humanFileSize(data.usage);
            const percentage = (data.usage / data.limit) * 100;
            setStorage({ limit, usage, free, percentage });
        });
    }, []);

    return (
        <Box bgColor={"gray.700"} rounded="md" p="4">
            <Text>Storage</Text>
            <Progress my="4" colorScheme="gray" size="sm" value={storage.percentage} />
            <Text fontSize={"sm"} color="gray.400" py="1">
                Used Space: {storage.usage}
            </Text>
            <Text fontSize={"sm"} color="gray.400" py="1">
                Free Space: {storage.free}
            </Text>
            <Text fontSize={"sm"} color="gray.400" py="1">
                Total Space: {storage.limit}
            </Text>
        </Box>
    );
}
