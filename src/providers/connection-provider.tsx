import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { checkIsConnected, checkIsAccountConnected } from "@/backend/autonomi";

// Define the shape of the context value
interface ConnectionContextType {
    isConnected: boolean;
    isAccountConnected: boolean;
}

// Create the context with a default value
const ConnectionContext = createContext<ConnectionContextType>({
    isConnected: false,
    isAccountConnected: false,
});

interface ConnectionProviderProps {
    children: ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
    children,
}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isAccountConnected, setIsAccountConnected] = useState(false);

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
            setIsAccountConnected(false);
            return;
        }

        try {
            const accountConnected = await checkIsAccountConnected();
            setIsAccountConnected(accountConnected);
        } catch (error) {
            console.error("Failed to fetch account connection status", error);
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
            checkAccountConnection(); // Check account if network is connected
        } else {
            setIsAccountConnected(false); // Reset account connection if network is disconnected
        }
    }, [isConnected]);

    return (
        <ConnectionContext.Provider value={{ isConnected, isAccountConnected }}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => useContext(ConnectionContext);
