import "tailwindcss/tailwind.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import GlobalStore from "../context/GlobalStore";
import { useState } from "react";

export default function MyApp({ Component, pageProps }) {
    const [store, setStore] = useState({});
    return (
        <GlobalStore.Provider value={{ store, setStore }}>
            <Component {...pageProps} />
        </GlobalStore.Provider>
    );
}
