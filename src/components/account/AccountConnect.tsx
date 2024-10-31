import { Button } from "../ui/button";
import { useState } from "react";
import { Copy, PowerIcon } from "lucide-react";
import { motion } from "framer-motion";
import Avatar from "./Avatar";
import { copyToClipboard } from "@/lib/utils/clipboard";

export default function WalletConnect() {
    const isConnected = true; // TODO update to use the new hook
    const address = "users-address"; // TODO update to use the new hook

    // TODO get this from the to be created hook by loziniak
    const addressData = {
        symbol: "ANT",
        value: 0.0,
        decimals: 18,
    };

    const balance = addressData ? (
        `${addressData.symbol}: ${addressData.value}`
    ) : (
        <></>
    );

    const [infoPanelOpen, setInfoPanelOpen] = useState(false);

    const disconnect = () => {
        //  TODO functionality to disconnect - this can be created via tauri commands to the backend.
    };

    const connect = () => {
        //  TODO functionality to connect - this can be created via tauri commands to the backend.
    };

    return (
        <div>
            {isConnected ? (
                <>
                    {address && (
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                setInfoPanelOpen(!infoPanelOpen);
                            }}
                        >
                            <Avatar address={address} />
                        </div>
                    )}

                    {infoPanelOpen && (
                        <div className="">
                            <div className="absolute right-3 mt-4 w-73 origin-top-right rounded-lg bg-white shadow-large  dark:bg-gray-900 border z-50">
                                <div className="border-b border-dashed border-gray-200 px-4 py-5 dark:border-gray-700">
                                    <div className="flex w-full mt-3 ">
                                        <div className="flex-grow rounded-lg bg-gray-100 px-2 py-1 text-sm tracking-tighter dark:bg-gray-800">
                                            {address && formatAddress(address)}
                                        </div>

                                        <div
                                            title="Copy Address"
                                            className="ml-2 flex cursor-pointer items-center text-gray-500 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                            onClick={() => {
                                                if (address) {
                                                    copyToClipboard(address);
                                                }
                                            }}
                                        >
                                            <Copy className="h-auto w-3.5" />
                                        </div>
                                    </div>

                                    <div className="mt-3 px-1 font-sm uppercase tracking-wider text-gray-900 dark:text-white">
                                        {balance}
                                    </div>

                                    {address && (
                                        <div className="px-1 font-sm uppercase tracking-wider text-gray-900 dark:text-white">
                                            {formatBalance(
                                                addressData.value,
                                                addressData.decimals
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 flex justify-center">
                                    <div
                                        className="flex cursor-pointer items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800 w-full"
                                        onClick={() => disconnect()}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.25 }}
                                            className="flex items-center justify-center"
                                        >
                                            <PowerIcon />
                                        </motion.div>
                                        <span className="uppercase text-center">
                                            Disconnect
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <Button
                    variant={"default"}
                    size={"sm"}
                    onClick={() => connect()}
                >
                    Connect Wallet
                </Button>
            )}
        </div>
    );
}
