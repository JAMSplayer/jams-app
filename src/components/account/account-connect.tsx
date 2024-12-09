import { Button } from "../ui/button";
import { useState } from "react";
import { PowerIcon } from "lucide-react";
import SignInPanel from "./sign-in/sign-in-panel";
import SignedInPanel from "./signed-in/signed-in-panel";
import CreateAccountPanel from "./create-account/create-account-panel";
import { disconnect as autonomiDisconnect } from "@/backend/autonomi";
import Avatar from "./avatar";

export default function AccountConnect() {
    // ====================================================================================
    // Visbility Functionality
    // ====================================================================================

    //  const [account, setAccount]
    const [account] = useState({
        username: "Dirvine",
        address: "0x3153176c72100b45bdA3A312E5d2fe12a1806a7A",
    }); // TODO get signed in account from new hook - make this null to see what signed out looks like
    const [isConnected, setIsConnected] = useState(false); // TODO update to use the new hook
    const [isConnectedPanelOpen, setIsConnectedPanelOpen] = useState(false);

    const SignedOutPanelState = {
        NONE: "none",
        SIGN_IN: "sign_in",
        CREATE_ACCOUNT: "create_account",
    };

    const [currentPanel, setCurrentPanel] = useState(SignedOutPanelState.NONE);

    const toggleSignInPanel = () => {
        // Toggle to SignInPanel if not currently open
        setCurrentPanel(
            currentPanel === SignedOutPanelState.SIGN_IN
                ? SignedOutPanelState.NONE
                : SignedOutPanelState.SIGN_IN
        );
    };

    const handleCreateAccountClicked = () => {
        setCurrentPanel(SignedOutPanelState.CREATE_ACCOUNT); // Close SignInPanel and open AddAccountPanel
    };

    const handleReturnToSignInPanelClicked = () => {
        setCurrentPanel(SignedOutPanelState.SIGN_IN);
    };

    const disconnect = () => {
        autonomiDisconnect();
        setIsConnected(false);
        setIsConnectedPanelOpen(false);
    };

    const connect = () => {
        //  TODO functionality to connect - this can be created via tauri commands to the backend.
        //  NOTE: connecting is an integral part of login and register functionalities, so it probably should be moved there.
        //setIsSignInPanelOpen(!isSignInPanelOpen);
        toggleSignInPanel();
    };

    return (
        <div>
            {isConnected ? (
                <>
                    {/* Account Signed In Area */}
                    {account && (
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                toggleSignInPanel();
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
                    {/* Signing In Area */}
                    <Button
                        variant={"default"}
                        size={"sm"}
                        onClick={() => connect()}
                    >
                        Connect Account
                    </Button>

                    {currentPanel === SignedOutPanelState.SIGN_IN && (
                        <div className="absolute right-3 mt-4 w-full max-w-md origin-top-right rounded-lg bg-card shadow-large border z-50">
                            <div className="border-b border-dashed px-4 py-5 border-secondary">
                                <SignInPanel
                                    onCreateAccountClicked={
                                        handleCreateAccountClicked
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {currentPanel === SignedOutPanelState.CREATE_ACCOUNT && (
                        <div className="absolute right-3 mt-4 w-full max-w-md origin-top-right rounded-lg bg-card shadow-large border z-50">
                            <div className="border-b border-dashed px-4 py-5 border-secondary">
                                <CreateAccountPanel
                                    onReturnToSignInPanelClicked={
                                        handleReturnToSignInPanelClicked
                                    }
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
