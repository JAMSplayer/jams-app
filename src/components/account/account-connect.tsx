import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { PowerIcon } from "lucide-react";
import SignInPanel from "./sign-in/sign-in-panel";
import SignedInPanel from "./signed-in/signed-in-panel";
import CreateAccountPanel from "./create-account/create-account-panel";
import Avatar from "./avatar";
import RecoverAccountPanel from "./recover-account/recover-account-panel";
import Portal from "../portal";
import { useConnection } from "@/providers/connection-provider";

export default function AccountConnect() {
    // ====================================================================================
    // Visbility Functionality
    // ====================================================================================

    const { account, signOut } = useConnection();

    const [panelVisible, setPanelVisible] = useState(false);

    const PanelState = {
        NONE: "none",
        SIGN_IN: "sign_in",
        CREATE_ACCOUNT: "create_account",
        RECOVER_ACCOUNT: "recover_account",
    };

    const [currentPanel, setCurrentPanel] = useState(PanelState.NONE);

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
            setCurrentPanel(PanelState.NONE);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCreateAccountClicked = () => {
        setCurrentPanel(PanelState.CREATE_ACCOUNT);
    };

    const handleReturnToSignInPanelClicked = () => {
        setCurrentPanel(PanelState.SIGN_IN);
    };

    const handleRecoverAccountClicked = () => {
        setCurrentPanel(PanelState.RECOVER_ACCOUNT);
    };

    const showSignInPanel = () => {
        // ensure any existing signed in account is set to null
        signOut();
        if (currentPanel === PanelState.SIGN_IN) {
            setCurrentPanel(PanelState.NONE);
        } else if (currentPanel === PanelState.NONE) {
            setCurrentPanel(PanelState.SIGN_IN);
        }
    };

    return (
        <div>
            {account ? (
                <>
                    {/* Account Signed In Area */}
                    {account && (
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                setPanelVisible(!panelVisible);
                            }}
                        >
                            <Avatar address={account.address} />
                        </div>
                    )}

                    {panelVisible && (
                        <div className="absolute right-3 mt-4 w-73 origin-top-right rounded-lg bg-card shadow-large border ">
                            {account && <SignedInPanel account={account} />}

                            <div className="p-3 flex justify-center z-20">
                                <div
                                    className="flex cursor-pointer items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-secondary w-full"
                                    onClick={() => signOut()}
                                >
                                    <div className="flex items-center justify-center">
                                        <PowerIcon />
                                    </div>
                                    <span className="uppercase text-center">
                                        Sign Out
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Signing In Area */}
                    <Button
                        variant={"default"}
                        size={"sm"}
                        ref={buttonRef}
                        onClick={() => showSignInPanel()}
                    >
                        Connect Account
                    </Button>

                    {currentPanel === PanelState.SIGN_IN && (
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

                    {currentPanel === PanelState.CREATE_ACCOUNT && (
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

                    {currentPanel === PanelState.RECOVER_ACCOUNT && (
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
