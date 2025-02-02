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

interface ConnectionContextType {
    isConnected: boolean;
    isConnecting: boolean;
    account: AccountUser | null;
    setIsConnecting: (value: boolean) => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
    isConnected: false,
    isConnecting: false,
    account: null,
    setIsConnecting: () => {},
});

interface ConnectionProviderProps {
    children: ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
    children,
}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false); // state for connection in progress
    const [account, setAccount] = useState<AccountUser | null>(null);

    // fetch account information when connected
    const fetchAccount = async () => {
        try {
            const accountConnected = await getConnectedUserAccount();
            setAccount(accountConnected || null);
        } catch (error) {
            console.error("Failed to fetch account connection status", error);
            setAccount(null);
        }
    };

    // initialize connection status on load
    const initializeConnection = async () => {
        setIsConnecting(true); // start connecting
        try {
            const connected = await checkNetworkConnection(); // Replace with actual connection-checking logic
            setIsConnected(connected);

            if (connected) {
                await fetchAccount(); // fetch account if connected
            }
        } catch (error) {
            console.error("Failed to initialize connection", error);
        } finally {
            setIsConnecting(false); // done connecting
        }
    };

    useEffect(() => {
        initializeConnection();

        const unlistenSignInPromise = listen("sign_in", async () => {
            console.log("Sign In event received");
            setIsConnecting(true);
            try {
                await fetchAccount();
            } finally {
                setIsConnecting(false);
            }
        });

        const unlistenConnectedPromise = listen("connected", async () => {
            console.log("Connected event received");
            setIsConnecting(true);
            try {
                setIsConnected(true);
                await fetchAccount();
            } finally {
                setIsConnecting(false);
            }
        });

        const unlistenDisconnectedPromise = listen("disconnected", () => {
            console.log("Disconnected event received");
            setIsConnected(false);
            setAccount(null);
        });

        return () => {
            unlistenSignInPromise.then((unlisten) => unlisten());
            unlistenConnectedPromise.then((unlisten) => unlisten());
            unlistenDisconnectedPromise.then((unlisten) => unlisten());
        };
    }, []);

    return (
        <ConnectionContext.Provider
            value={{
                isConnected,
                isConnecting,
                account,
                setIsConnecting, // expose the setter for external use
            }}
        >
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => useContext(ConnectionContext);
