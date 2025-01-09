import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { PowerIcon } from "lucide-react";
import SignInPanel from "./sign-in/sign-in-panel";
import SignedInPanel from "./signed-in/signed-in-panel";
import CreateAccountPanel from "./create-account/create-account-panel";
import { disconnect as autonomiDisconnect } from "@/backend/autonomi";
import Avatar from "./avatar";
import RecoverAccountPanel from "./recover-account/recover-account-panel";
import Portal from "../portal";

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
        RECOVER_ACCOUNT: "recover_account",
    };

    const [currentPanel, setCurrentPanel] = useState(SignedOutPanelState.NONE);

    const divRef = useRef<HTMLDivElement>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (
            divRef.current &&
            !divRef.current.contains(event.target as Node) &&
            !(
                buttonRef.current &&
                buttonRef.current.contains(event.target as Node)
            ) // Ensure it doesn't close when clicking the button
        ) {
            setCurrentPanel(SignedOutPanelState.NONE);
            toggleSignInPanel();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleSignInPanel = () => {
        // Toggle to SignInPanel if not currently open

        if (currentPanel === SignedOutPanelState.NONE) {
            setCurrentPanel(SignedOutPanelState.SIGN_IN);
        } else {
            setCurrentPanel(SignedOutPanelState.NONE);
        }
    };

    const handleCreateAccountClicked = () => {
        setCurrentPanel(SignedOutPanelState.CREATE_ACCOUNT); // Close SignInPanel and open AddAccountPanel
    };

    const handleReturnToSignInPanelClicked = () => {
        setCurrentPanel(SignedOutPanelState.SIGN_IN);
    };

    const handleRecoverAccountClicked = () => {
        setCurrentPanel(SignedOutPanelState.RECOVER_ACCOUNT);
    };

    const disconnect = () => {
        autonomiDisconnect();
        setIsConnected(false);
        setIsConnectedPanelOpen(false);
    };

    const connect = () => {
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
                            <div className="absolute right-3 mt-4 w-73 origin-top-right rounded-lg bg-card shadow-large border">
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
                        ref={buttonRef}
                        onClick={() => connect()}
                    >
                        Connect Account
                    </Button>

                    {currentPanel === SignedOutPanelState.SIGN_IN && (
                        <Portal>
                            <div
                                ref={divRef}
                                className="absolute right-3 mt-4 w-full max-w-md origin-top-right rounded-lg bg-card shadow-large border"
                            >
                                <div className="border-b px-4 py-5 border-secondary">
                                    <SignInPanel
                                        onCreateAccountClicked={
                                            handleCreateAccountClicked
                                        }
                                        onRecoverAccountClicked={
                                            handleRecoverAccountClicked
                                        }
                                    />
                                </div>
                            </div>
                        </Portal>
                    )}

                    {currentPanel === SignedOutPanelState.CREATE_ACCOUNT && (
                        <Portal>
                            <div
                                ref={divRef}
                                className="absolute right-3 mt-4 w-full max-w-md origin-top-right rounded-lg bg-card shadow-large border"
                            >
                                <div className="border-b px-4 py-5 border-secondary">
                                    <CreateAccountPanel
                                        onReturnToSignInPanelClicked={
                                            handleReturnToSignInPanelClicked
                                        }
                                    />
                                </div>
                            </div>
                        </Portal>
                    )}

                    {currentPanel === SignedOutPanelState.RECOVER_ACCOUNT && (
                        <Portal>
                            <div
                                ref={divRef}
                                className="absolute right-3 mt-4 w-full max-w-md origin-top-right rounded-lg bg-card shadow-large border"
                            >
                                <div className="border-b px-4 py-5 border-secondary">
                                    <RecoverAccountPanel
                                        onReturnToSignInPanelClicked={
                                            handleReturnToSignInPanelClicked
                                        }
                                    />
                                </div>
                            </div>
                        </Portal>
                    )}
                </>
            )}
        </div>
    );
}
