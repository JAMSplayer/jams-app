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
import { isConnected as checkNetworkConnection } from "@/backend/autonomi";
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

    // Initialize connection status on load
    const initializeConnection = async () => {
        try {
            const connected = await checkNetworkConnection(); // Replace with actual connection-checking logic
            setIsConnected(connected);

            if (connected) {
                await fetchAccount(); // Fetch account if connected
            }
        } catch (error) {
            console.error("Failed to initialize connection", error);
        }
    };

    // Set up event listeners for connection updates
    useEffect(() => {
        initializeConnection(); // Perform initial connection check

        const unlistenSignIn = listen("sign_in", () => {
            console.log("Sign In event received");
            fetchAccount(); // sign in on connection
        });

        const unlistenConnected = listen("connected", () => {
            console.log("Connected event received");
            setIsConnected(true);
            fetchAccount(); // try to fetch account on connection
        });

        const unlistenDisconnected = listen("disconnected", () => {
            console.log("Disconnected event received");
            setIsConnected(false);
            setAccount(null); // Clear account on disconnection
        });

        // Clean up listeners on unmount
        return () => {
            unlistenSignIn.then((unlisten) => unlisten());
            unlistenConnected.then((unlisten) => unlisten());
            unlistenDisconnected.then((unlisten) => unlisten());
        };
    }, []);

    return (
        <ConnectionContext.Provider value={{ isConnected, account }}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => useContext(ConnectionContext);
