import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { checkIsConnected } from "@/backend/autonomi";

const ConnectionContext = createContext({
    isConnected: false,
});

interface ConnectionProviderProps {
    children: ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
    children,
}) => {
    const [isConnected, setIsConnected] = useState(false);

    // Function to check connection status
    const checkConnection = async () => {
        try {
            const isConnected = await checkIsConnected();
            setIsConnected(isConnected);
        } catch (error) {
            console.error("failed to fetch connection status", error);
        }
    };

    // Check connection on mount and set interval to poll
    useEffect(() => {
        checkConnection(); // initial check
        const intervalId = setInterval(checkConnection, 5000);
        return () => clearInterval(intervalId); // clear interval on unmount
    }, []);

    return (
        <ConnectionContext.Provider value={{ isConnected }}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => useContext(ConnectionContext);
