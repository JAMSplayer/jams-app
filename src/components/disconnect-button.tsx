import { useConnection } from "@/providers/connection-provider";
import { Button } from "./ui/button";
import { PowerIcon } from "lucide-react";

const DisconnectButton = () => {
    const { disconnectNetwork, isConnected } = useConnection();

    if (!isConnected) return null;

    return (
        <Button
            onClick={() => disconnectNetwork()}
            className="px-3 rounded-full hover:bg-opacity-70 transition"
        >
            <PowerIcon size={24} />
        </Button>
    );
};

export default DisconnectButton;
