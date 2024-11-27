import { connect } from "@/backend/autonomi";
import { Button } from "./ui/button";
import { GlobeLockIcon, ZapOffIcon } from "lucide-react";

export default function DisconnectedPanel() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <ZapOffIcon size={50} />
            <p className="mt-8 text-pretty text-lg font-medium sm:text-xl/8 text-center flex items-center justify-center gap-2">
                You are disconnected
            </p>

            <div className="mt-6">
                <Button
                    onClick={() => {
                        connect();
                    }}
                >
                    Connect to network
                    <GlobeLockIcon />
                </Button>
            </div>
        </div>
    );
}
