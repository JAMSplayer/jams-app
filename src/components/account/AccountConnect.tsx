import { Button } from "../ui/button";
import { useState } from "react";
import { Copy, PowerIcon, UserRoundPlusIcon } from "lucide-react";
import Avatar from "./Avatar";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatAddress } from "@/lib/utils/address";
import { formatBalance } from "@/lib/utils/balance";
import SignInPanel from "./sign-in/SignInPanel";
import SignedInPanel from "./signed-in/SignedInPanel";

export default function AccountConnect() {
    // ====================================================================================
    // Visbility Functionality
    // ====================================================================================

    const [account, setAccount] = useState({
        username: "Dirvine",
        address: "0x3153176c72100b45bdA3A312E5d2fe12a1806a7A",
    }); // TODO get signed in account from new hook - make this null to see what signed out looks like
    const [isConnected, setIsConnected] = useState(true); // TODO update to use the new hook
    const [isConnectedPanelOpen, setIsConnectedPanelOpen] = useState(false);
    const [isSignInPanelOpen, setIsSignInPanelOpen] = useState(false);

    const disconnect = () => {
        //  TODO functionality to disconnect - this can be created via tauri commands to the backend.
        setIsConnected(false);
        setIsConnectedPanelOpen(false);
    };

    const connect = () => {
        //  TODO functionality to connect - this can be created via tauri commands to the backend.
        setIsSignInPanelOpen(!isSignInPanelOpen);
    };

    return (
        <div>
            {isConnected ? (
                <>
                    {account && (
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                setIsConnectedPanelOpen(!isConnectedPanelOpen);
                            }}
                        >
                            <Avatar address={account.address} />
                        </div>
                    )}

                    {isConnectedPanelOpen && (
                        <>
                            <div className="absolute right-3 mt-4 w-73 origin-top-right rounded-lg bg-card shadow-large border z-50">
                                <SignedInPanel account={account} />

                                <div className="p-3 flex justify-center">
                                    <div
                                        className="flex cursor-pointer items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-secondary w-full"
                                        onClick={() => disconnect()}
                                    >
                                        <div className="flex items-center justify-center">
                                            <PowerIcon />
                                        </div>
                                        <span className="uppercase text-center">
                                            Disconnect
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    <Button
                        variant={"default"}
                        size={"sm"}
                        onClick={() => connect()}
                    >
                        Connect Account
                    </Button>

                    {isSignInPanelOpen && (
                        <div className="absolute right-3 mt-4 w-full max-w-md origin-top-right rounded-lg bg-card shadow-large border z-50">
                            <div className="border-b border-dashed px-4 py-5 border-secondary">
                                <SignInPanel />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
