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
                        // TODO connect to network
                        // This page will be shown if the network is not connected automatically on app load
                    }}
                >
                    Connect to network
                </Button>
            </div>
        </div>
    );
}
