import theme from "@/hooks/theme";
import "@/public/tailwind.css";
import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider theme={theme}>
            <Component {...pageProps} />
        </ChakraProvider>
    );
}
