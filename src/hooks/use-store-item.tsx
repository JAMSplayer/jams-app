import { useState, useEffect } from "react";
import { Store } from "@tauri-apps/plugin-store";

export default function useStoreItem<T>(
    store: Store | null,
    key: string,
    defaultValue: T
): T {
    const [item, setItem] = useState<T>(defaultValue);

    useEffect(() => {
        const getItem = async () => {
            if (!store) return;

            try {
                const savedItem = await store.get<T>(key);
                setItem(savedItem ?? defaultValue);
            } catch (err) {
                console.error(`Failed to load item for key: ${key}`, err);
            }
        };

        getItem();
    }, [store, key]);

    return item;
}
