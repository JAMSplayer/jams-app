import { useState, useEffect } from "react";

export const useDebouncedValue = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler); // Cleanup timeout if value changes before delay
        };
    }, [value, delay]);

    return debouncedValue;
};
