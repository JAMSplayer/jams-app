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

    // set up event listeners for connection updates
    useEffect(() => {
        initializeConnection(); // perform initial connection check

        const unlistenSignIn = listen("sign_in", async () => {
            console.log("Sign In event received");
            setIsConnecting(true);
            try {
                await fetchAccount(); // fetch account on sign-in
            } finally {
                setIsConnecting(false); // done connecting
            }
        });

        const unlistenConnected = listen("connected", async () => {
            console.log("Connected event received");
            setIsConnecting(true);
            try {
                setIsConnected(true);
                await fetchAccount(); // try to fetch account on connection
            } finally {
                setIsConnecting(false); // done connecting
            }
        });

        const unlistenDisconnected = listen("disconnected", () => {
            console.log("Disconnected event received");
            setIsConnected(false);
            setAccount(null); // clear account on disconnection
        });

        // clean up listeners on unmount
        return () => {
            unlistenSignIn.then((unlisten) => unlisten());
            unlistenConnected.then((unlisten) => unlisten());
            unlistenDisconnected.then((unlisten) => unlisten());
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
