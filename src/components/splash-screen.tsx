import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useConnection } from "@/providers/connection-provider";
import { connect } from "@/backend/logic";
import Networks from "@/enums/networks";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const { isConnected } = useConnection();
    const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);

    useEffect(() => {
        const attemptConnection = async () => {
            try {
                console.log("Attempting to connect...");
                const override = { network: Networks.MAINNET };
                await connect(override);
                // TODO - the await above isn't working it's instantly writing out the following log
                console.log("Connection successful");
            } catch (error) {
                console.error("Connection failed:", error);
            } finally {
                setHasAttemptedConnection(true); // mark the connection attempt as finished
            }
        };

        // check if already connected to the network
        if (!isConnected) {
            attemptConnection(); // if not connected, attempt to connect
        } else {
            setHasAttemptedConnection(true); // already connected, move to next screen
        }
    }, []);

    useEffect(() => {
        if (hasAttemptedConnection) {
            setTimeout(() => {
                onComplete(); // notify parent component to hide splash screen
            }, 500); // wait for fade-out animation to complete
        }
    }, [hasAttemptedConnection, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
            />
            <p className="mt-4 text-lg font-medium">Connecting to Mainnet...</p>
        </motion.div>
    );
};

export default SplashScreen;
