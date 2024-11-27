import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { listen } from "@tauri-apps/api/event";
import { getConnectedUserAccount } from "@/backend/logic";
import { AccountUser } from "@/types/account-user";

// Define the shape of the context value
interface ConnectionContextType {
    isConnected: boolean;
    account: AccountUser | null;
}

// Create the context with a default value
const ConnectionContext = createContext<ConnectionContextType>({
    isConnected: false,
    account: null,
});

interface ConnectionProviderProps {
    children: ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
    children,
}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState<AccountUser | null>(null);

    // Fetch account information when connected
    const fetchAccount = async () => {
        try {
            const accountConnected = await getConnectedUserAccount();
            setAccount(accountConnected || null);
        } catch (error) {
            console.error("Failed to fetch account connection status", error);
            setAccount(null);
        }
    };

    // Set up event listeners for connection updates
    useEffect(() => {
        const unlistenConnect = listen("connect", () => {
            console.log("Connected event received");
            setIsConnected(true);
            fetchAccount(); // Fetch account on connection
        });

        const unlistenDisconnect = listen("disconnect", () => {
            console.log("Disconnected event received");
            setIsConnected(false);
            setAccount(null); // Clear account on disconnection
        });

        // Clean up listeners on unmount
        return () => {
            unlistenConnect.then((unlisten) => unlisten());
            unlistenDisconnect.then((unlisten) => unlisten());
        };
    }, []);

    return (
        <ConnectionContext.Provider value={{ isConnected, account }}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => useContext(ConnectionContext);
