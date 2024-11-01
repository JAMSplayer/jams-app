import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Copy, PowerIcon, UserRoundPlusIcon } from "lucide-react";
import Avatar from "./Avatar";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatAddress } from "@/lib/utils/address";
import { formatBalance } from "@/lib/utils/balance";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function AccountConnect() {
    const address = "0x3153176c72100b45bdA3A312E5d2fe12a1806a7A"; // TODO update to use the new hook
    const [username, setUsername] = useState("");
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

    const [currentlySelectedRecentAccount, setCurrentlySelectedRecentAccount] =
        useState<RecentAccount | null>(null);

    interface RecentAccount {
        username: string;
        address: string;
    }

    const [recentAccountList, setRecentAccountList] = useState<RecentAccount[]>(
        [
            {
                username: "username1",
                address: "0x3153176c72100b45bdA3A312E5d2fe12a1806a7A",
            },
            {
                username: "username2",
                address: "0x9153176c72100b25bdA3A312E5d2fe12a1806a9B",
            },
            {
                username: "username3",
                address: "0x9153176c72100b25bdA3A312E5d2fe12a1806a9B",
            },
            {
                username: "username4",
                address: "0x9153176c72100b25bdA3A312E5d2fe12a1806a9B",
            },
        ]
    );

    useEffect(() => {
        if (currentlySelectedRecentAccount) {
            setUsername(currentlySelectedRecentAccount.username);
        } else {
            setUsername(""); // Clear input if no account is selected
        }
    }, [currentlySelectedRecentAccount]);

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

    const clickedRecentAccount = (recentAccount: RecentAccount) => {
        // TODO
        // populate sign in username field + address info text and switch to it
        setCurrentlySelectedRecentAccount(recentAccount);
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
                        <div className="absolute right-3 mt-4 w-full max-w-md origin-top-right rounded-lg bg-card shadow-large border z-50">
                            <div className="border-b border-dashed px-4 py-5 border-secondary">
                                <Tabs
                                    defaultValue={
                                        recentAccountList.length == 0
                                            ? "sign-in"
                                            : "recent"
                                    }
                                >
                                    <TabsList className="flex w-full">
                                        <TabsTrigger
                                            value="sign-in"
                                            className="flex-1 text-center"
                                        >
                                            <span className="block w-full text-center">
                                                Sign In
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="recent"
                                            className="flex-1 text-center"
                                        >
                                            <span className="block w-full text-center">
                                                Recent
                                            </span>
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="sign-in">
                                        <div className="px-4">
                                            <form className="flex flex-col space-y-4">
                                                <div className="flex flex-col">
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
                                                            value={username}
                                                            onChange={(e) =>
                                                                setUsername(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex justify-end text-sm mt-1">
                                                        {currentlySelectedRecentAccount?.username ==
                                                        username
                                                            ? formatAddress(
                                                                  currentlySelectedRecentAccount.address
                                                              )
                                                            : ""}
                                                    </div>
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
                                    </TabsContent>
                                    <TabsContent value="recent">
                                        <ScrollArea className="h-[200px] w-full rounded-md border">
                                            {recentAccountList.map(
                                                (recentAccount) => (
                                                    <div
                                                        key={
                                                            recentAccount.address
                                                        }
                                                        className="flex items-center space-x-2 p-2  px-4 border-b border-muted cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                                        onClick={() => {
                                                            clickedRecentAccount(
                                                                recentAccount
                                                            );
                                                        }}
                                                    >
                                                        <div className="shrink-0">
                                                            <Avatar
                                                                address={
                                                                    recentAccount.address
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <div className="font-medium">
                                                                {formatAddress(
                                                                    recentAccount.address
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    recentAccount.username
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            <ScrollBar
                                                orientation="vertical"
                                                className="bg-secondary"
                                            />
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
