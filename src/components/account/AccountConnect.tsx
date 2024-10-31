import { Button } from "../ui/button";
import { useState } from "react";
import { Copy, PowerIcon, UserRoundPlusIcon } from "lucide-react";
import Avatar from "./Avatar";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatAddress } from "@/lib/utils/address";
import { formatBalance } from "@/lib/utils/balance";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function AccountConnect() {
    const address = "0x3153176c72100b45bdA3A312E5d2fe12a1806a7A"; // TODO update to use the new hook
    const username = "Dirvine"; // TODO update to use the new hook
    // TODO get this from the to be created hook by loziniak
    const addressData = {
        symbol: "ANT",
        value: 0.0,
        decimals: 18,
    };

    const balance = addressData ? (
        `${addressData.symbol}: ${formatBalance(
            addressData.value,
            addressData.decimals
        )}`
    ) : (
        <></>
    );

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

    const signIn = () => {
        //  TODO
    };

    const addAccount = () => {
        //  TODO
    };

    return (
        <div>
            {isConnected ? (
                <>
                    {address && (
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                setIsConnectedPanelOpen(!isConnectedPanelOpen);
                            }}
                        >
                            <Avatar address={address} />
                        </div>
                    )}

                    {isConnectedPanelOpen && (
                        <>
                            <div className="absolute right-3 mt-4 w-73 origin-top-right rounded-lg bg-card shadow-large border z-50">
                                <div className="border-b border-dashed px-4 py-5 border-secondary">
                                    {username}
                                    <div className="flex w-full mt-3">
                                        <div className="flex-grow rounded-lg bg-secondary px-2 py-1 text-sm tracking-tighter">
                                            {address && formatAddress(address)}
                                        </div>

                                        <div
                                            title="Copy Address"
                                            className="ml-2 flex cursor-pointer items-center transition"
                                            onClick={() => {
                                                if (address) {
                                                    copyToClipboard(address);
                                                }
                                            }}
                                        >
                                            <Copy className="h-auto w-3.5" />
                                        </div>
                                    </div>

                                    {address && (
                                        <div className="mt-3 px-1 font-sm uppercase tracking-wider">
                                            {balance}
                                        </div>
                                    )}
                                </div>

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
                        <>
                            <div className="absolute right-3 mt-4 w-73 origin-top-right rounded-lg bg-card shadow-large border z-50">
                                <div className="border-b border-dashed px-4 py-5 border-secondary">
                                    <form className="flex flex-col space-y-4">
                                        <div className="flex items-center">
                                            <Label
                                                htmlFor="username"
                                                className="mr-2"
                                            >
                                                Username
                                            </Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder="Enter your username"
                                                className="flex-1"
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <Label
                                                htmlFor="password"
                                                className="mr-2"
                                            >
                                                Password
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter your password"
                                                className="flex-1"
                                            />
                                        </div>

                                        <Button
                                            onClick={() => signIn()}
                                            className="mt-4"
                                        >
                                            Sign In
                                        </Button>
                                    </form>
                                </div>

                                <div className="p-3 flex justify-center">
                                    <div
                                        className="flex cursor-pointer items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-secondary w-full"
                                        onClick={() => addAccount()}
                                    >
                                        <div className="flex items-center justify-center">
                                            <UserRoundPlusIcon />
                                        </div>
                                        <span className="uppercase text-center">
                                            Add Account
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
