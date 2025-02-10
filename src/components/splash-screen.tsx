import { useEffect } from "react";
import { motion } from "motion/react";
import { useConnection } from "@/providers/connection-provider";
import { connect } from "@/backend/logic";
import Networks from "@/enums/networks";

const SplashScreen = () => {
    const { isConnected } = useConnection();

    useEffect(() => {
        console.log("isConnected changed:", isConnected);
        const attemptConnection = async () => {
            try {
                console.log("Attempting to connect...");
                const override = { network: Networks.MAINNET };
                await connect(override);
            } catch (error) {
                console.error("Connection failed:", error);
            }
        };

        if (!isConnected) {
            attemptConnection(); // if not connected, attempt to connect
        }
    }, [isConnected]);

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
