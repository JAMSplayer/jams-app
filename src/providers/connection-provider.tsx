import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { checkIsConnected, checkIsAccountConnected } from "@/backend/logic";
import { AccountUser } from "@/types/account-user";

// TODO:
// * handle connect (username, address) / disconnect events from Rust.

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

    // Function to check network connection status
    const checkConnection = async () => {
        try {
            const networkConnected = await checkIsConnected();
            setIsConnected(networkConnected);
        } catch (error) {
            console.error("Failed to fetch network connection status", error);
        }
    };

    // Function to check account connection status
    const checkAccountConnection = async () => {
        if (!isConnected) {
            setAccount(null);
            return;
        }

        try {
            const accountConnected = await checkIsAccountConnected();
            setAccount(accountConnected || null);
        } catch (error) {
            console.error("Failed to fetch account connection status", error);
            setAccount(null);
        }
    };

    // Check connection on mount and set interval to poll
    useEffect(() => {
        checkConnection(); // Initial network check
        const intervalId = setInterval(checkConnection, 5000);
        return () => clearInterval(intervalId); // Clear interval on unmount
    }, []);

    // Check account connection when the network connection changes
    useEffect(() => {
        if (isConnected) {
            checkAccountConnection();
        } else {
            setAccount(null);
        }
    }, [isConnected]);

    return (
        <ConnectionContext.Provider value={{ isConnected, account }}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => useContext(ConnectionContext);
