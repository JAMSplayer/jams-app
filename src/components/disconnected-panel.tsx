import { connect } from "@/backend/autonomi";
import { Button } from "./ui/button";

export default function DisconnectedPanel() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="mt-6 text-pretty text-lg font-medium sm:text-xl/8 text-center">
                You are disconnected
            </p>
            <div className="mt-4">
                <Button
                    onClick={() => {
                        connect();
                    }}
                >
                    Connect to network
                </Button>
            </div>
        </div>
    );
}
