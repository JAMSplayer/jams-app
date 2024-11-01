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

import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/form-schemas/sign-in-schema";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { RecentAccount } from "@/types/recent-account";
import RecentAccounts from "./RecentAccounts";

export default function AccountConnect() {
    // ====================================================================================
    // Account / Balance Functionality
    // ====================================================================================

    const address = "0x3153176c72100b45bdA3A312E5d2fe12a1806a7A"; // TODO update to use the new hook
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

    // ====================================================================================
    // Visbility Functionality
    // ====================================================================================

    const [isConnected, setIsConnected] = useState(false); // TODO update to use the new hook
    const [isConnectedPanelOpen, setIsConnectedPanelOpen] = useState(false);
    const [isSignInPanelOpen, setIsSignInPanelOpen] = useState(false);

    // ====================================================================================
    // Recent Accounts Functionality
    // ====================================================================================

    // Callback function to update the currently selected account from the RecentAccounts tab
    const handleSelectAccount = (recentAccount: RecentAccount) => {
        // set the username field to be the recent account

        // check for the account and update the accountExists state
        const foundAccount = recentAccountList.find(
            (account) => account.username === recentAccount.username
        );
        setAccountExists(foundAccount || null); // Update accountExists state
        if (!accountExists) {
            toast("Register Warning", {
                description: "This username does not exist.",
            });
        } else {
            // Set the username field in the form to the selected recent account's username
            setValue("username", recentAccount.username);
            // set the active tab to sign-in
            setActiveTab("sign-in");
        }
    };

    // currently we are using this as a way to store all existing accounts
    const [recentAccountList, setRecentAccountList] = useState<RecentAccount[]>(
        [
            {
                username: "username1",
                address: "0x3153176c72100b45bdA3A312E5d2fe12a1806a7A",
            },
            {
                username: "username2",
                address: "0x9153176c72100b25bdA3A113E5d2fe12a1806a9B",
            },
            {
                username: "username3",
                address: "0x9153176c72100b25bdA2A312E5d2fe12a1806a9B",
            },
            {
                username: "username4",
                address: "0x9153176c72100b25bdA3D312E5d2fe12a1806a9B",
            },
        ]
    );

    // ====================================================================================
    // Tab Functionality
    // ====================================================================================

    const [activeTab, setActiveTab] = useState(
        recentAccountList.length === 0 ? "sign-in" : "recent"
    );

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const signInForm = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });
    const { watch, handleSubmit, control, formState, setValue, register } =
        signInForm;
    const username = watch("username");
    const [accountExists, setAccountExists] = useState<RecentAccount | null>(
        null
    );

    // Effect to update accountExists based on username input
    useEffect(() => {
        const foundAccount = recentAccountList.find(
            (account) => account.username === username
        );
        setAccountExists(foundAccount || null); // Set accountExists to found account or null
    }, [username, recentAccountList]);

    const signIn = (values: z.infer<typeof signInSchema>) => {
        //  TODO
        const usernameExists = recentAccountList.some(
            (account) => account.username === username
        );

        if (!usernameExists) {
            toast("Register Warning", {
                description: "This username does not exist.",
            });
        }
    };

    const disconnect = () => {
        //  TODO functionality to disconnect - this can be created via tauri commands to the backend.
        setIsConnected(false);
        setIsConnectedPanelOpen(false);
    };

    const connect = () => {
        //  TODO functionality to connect - this can be created via tauri commands to the backend.
        setIsSignInPanelOpen(!isSignInPanelOpen);
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
                        <div className="absolute right-3 mt-4 w-full max-w-md origin-top-right rounded-lg bg-card shadow-large border z-50">
                            <div className="border-b border-dashed px-4 py-5 border-secondary">
                                <Tabs
                                    value={activeTab}
                                    onValueChange={handleTabChange}
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
                                            <Form {...signInForm}>
                                                <form
                                                    onSubmit={handleSubmit(
                                                        signIn
                                                    )}
                                                    className="space-y-8 pt-4"
                                                >
                                                    <FormField
                                                        control={control}
                                                        name="username"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Username
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Enter your username"
                                                                        autoCapitalize="off"
                                                                        autoComplete="off"
                                                                        autoCorrect="off"
                                                                        {...field} // Spread field instead of using register directly
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            field.onChange(
                                                                                e
                                                                            ); // Call the default onChange to update the form state
                                                                            setAccountExists(
                                                                                recentAccountList.find(
                                                                                    (
                                                                                        account
                                                                                    ) =>
                                                                                        account.username ===
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                ) ||
                                                                                    null
                                                                            );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                                <div className="flex justify-end text-sm mt-1">
                                                                    {accountExists && (
                                                                        <div className="flex justify-end text-sm mt-1">
                                                                            {formatAddress(
                                                                                accountExists.address
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={
                                                            signInForm.control
                                                        }
                                                        name="password"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Password
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Enter your password"
                                                                        type="password"
                                                                        autoCapitalize="off"
                                                                        autoComplete="off"
                                                                        autoCorrect="off"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <Button
                                                        type="submit"
                                                        className="mt-4 w-full"
                                                        disabled={
                                                            !formState.isValid
                                                        }
                                                    >
                                                        Sign In
                                                    </Button>
                                                </form>
                                            </Form>

                                            <div className="pt-3 flex justify-center">
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
                                        <RecentAccounts
                                            recentAccounts={recentAccountList}
                                            onSelectRecentAccount={
                                                handleSelectAccount
                                            }
                                        />
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
