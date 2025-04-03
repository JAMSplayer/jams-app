import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { listen } from "@tauri-apps/api/event";
import {
    connect,
    getConnectedUserAccount,
    signOut as backendSignOut,
} from "@/backend/logic";
import { AccountUser } from "@/types/account-user";
import { isConnected as checkNetworkConnection } from "@/backend/autonomi";
import { disconnect } from "@/backend/autonomi";
import Networks from "@/enums/networks";
import { useNavigate } from "react-router-dom";

interface ConnectionContextType {
    isConnected: boolean;
    isConnecting: boolean;
    account: AccountUser | null;
    setIsConnecting: (value: boolean) => void;
    disconnectNetwork: () => Promise<void>;
    connectToNetwork: () => Promise<void>;
    signOut: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType>({
    isConnected: false,
    isConnecting: false,
    account: null,
    setIsConnecting: () => {},
    disconnectNetwork: async () => {},
    connectToNetwork: async () => {},
    signOut: async () => {},
});

interface ConnectionProviderProps {
    children: ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
    children,
}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [account, setAccount] = useState<AccountUser | null>(null);
    const navigate = useNavigate();

    const disconnectNetwork = async () => {
        try {
            console.log("Attempting to disconnect...");
            const success = await disconnect();
            if (success) {
                setIsConnected(false);
                setAccount(null);
                await backendSignOut();
                console.log("Successfully disconnected.");
            }
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    };

    const signOut = async () => {
        console.log("Signing out user sign out user...");
        setAccount(null);
        await backendSignOut();
        navigate("/");
    };

    // connect to network
    const connectToNetwork = async () => {
        setIsConnecting(true);

        try {
            // TODO update here based on what network is selected in app
            const override = { network: Networks.MAINNET };
            await connect(override);
        } catch (error) {
            console.error("Error connecting:", error);
        } finally {
            setIsConnecting(false);
        }
    };

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
            const connected = await checkNetworkConnection();
            setIsConnected(connected);

            if (connected) {
                await fetchAccount(); // fetch account if connected
            }
        } catch (error) {
            console.error("Failed to initialize connection", error);
            setIsConnected(false);
        } finally {
            setIsConnecting(false); // done connecting
        }
    };

    // set up event listeners for connection updates
    useEffect(() => {
        initializeConnection();

        let unlistenSignIn: (() => void) | null = null;
        let unlistenConnected: (() => void) | null = null;
        let unlistenDisconnected: (() => void) | null = null;

        const setupListeners = async () => {
            unlistenSignIn = await listen("sign_in", async () => {
                console.log("Sign In event received");

                try {
                    await fetchAccount();
                } catch (error) {
                    console.log("fetch account error: ", error);
                }
            });

            unlistenConnected = await listen("connected", async () => {
                console.log("Connected event received");
                setIsConnected(true);
                await fetchAccount();
            });

            unlistenDisconnected = await listen("disconnected", async () => {
                console.log("Disconnected event received");
                setIsConnected(false);
                setAccount(null);
                await backendSignOut();
            });
        };

        setupListeners();

        return () => {
            unlistenSignIn?.();
            unlistenConnected?.();
            unlistenDisconnected?.();
        };
    }, []);

    return (
        <ConnectionContext.Provider
            value={{
                isConnected,
                isConnecting,
                account,
                setIsConnecting,
                disconnectNetwork,
                connectToNetwork,
                signOut,
            }}
        >
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => useContext(ConnectionContext);
