import { useEffect, useRef } from "react";

function useInterval(callback: () => void, delay: number) {
    const savedCallback = useRef(callback);
    useEffect(() => {
        savedCallback.current = callback;
        if (!delay && delay !== 0) {
            return;
        }
        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay, callback]);
}

export default useInterval;
