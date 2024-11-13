import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/form-schemas/sign-in-schema";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../ui/form";
import { useEffect, useState } from "react";
import { formatAddress } from "@/lib/utils/address";
import { Button } from "@/components/ui/button";
import { UserRoundPlusIcon } from "lucide-react";
import RecentAccounts from "./RecentAccounts";
import { AccountUser } from "@/types/account-user";

interface SignInPanelProps {
    onCreateAccountClicked: () => void;
}

const SignInPanel: React.FC<SignInPanelProps> = ({
    onCreateAccountClicked,
}) => {
    // ====================================================================================
    // Sign In Form Functionality
    // ====================================================================================

    const signInForm = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });
    const { watch, handleSubmit, control, formState, setValue } = signInForm;
    const username = watch("username");
    const [accountExists, setAccountExists] = useState<AccountUser | null>(
        null
    );

    // ====================================================================================
    // Recent Accounts Functionality
    // ====================================================================================

    // Callback function to update the currently selected account from the RecentAccounts tab
    const handleSelectAccount = (recentAccount: AccountUser) => {
        // Find the account based on the selected recent account
        const foundAccount = recentAccountList.find(
            (account) => account.username === recentAccount.username
        );

        // Update accountExists state
        setAccountExists(foundAccount || null);

        // Check if foundAccount exists instead of accountExists
        if (!foundAccount) {
            toast("Register Warning", {
                description: "This username does not exist.",
            });
        } else {
            // Set the username field in the form to the selected recent account's username
            setValue("username", recentAccount.username);
            // Set the active tab to sign-in
            setActiveTab("sign-in");
        }
    };

    // TODO currently we are using this as a way to store all existing accounts - get from the hook
    const [recentAccountList, setRecentAccountList] = useState<AccountUser[]>([
        {
            username: "username1",
            address: "0x3153176c72100b45bdA3A312E5d2fe12a1806a7A",
            password: "",
            dateCreated: new Date(),
            dateUpdated: new Date(),
        },
        {
            username: "username2",
            address: "0x9153176c72100b25bdA3A113E5d2fe12a1806a9B",
            password: "",
            dateCreated: new Date(),
            dateUpdated: new Date(),
        },
        {
            username: "username3",
            address: "0x9153176c72100b25bdA2A312E5d2fe12a1806a9B",
            password: "",
            dateCreated: new Date(),
            dateUpdated: new Date(),
        },
        {
            username: "username4",
            address: "0x9153176c72100b25bdA3D312E5d2fe12a1806a9B",
            password: "",
            dateCreated: new Date(),
            dateUpdated: new Date(),
        },
    ]);

    // ====================================================================================
    // Tab Functionality
    // ====================================================================================

    const [activeTab, setActiveTab] = useState(
        recentAccountList.length === 0 ? "sign-in" : "recent"
    );

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

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

    const handleCreateAccountClicked = () => {
        onCreateAccountClicked();
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="flex w-full">
                <TabsTrigger value="sign-in" className="flex-1 text-center">
                    <span className="block w-full text-center">Sign In</span>
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex-1 text-center">
                    <span className="block w-full text-center">Recent</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in">
                <div className="px-4">
                    <Form {...signInForm}>
                        <form onSubmit={handleSubmit(signIn)} className=" pt-4">
                            <FormField
                                control={control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your username"
                                                autoCapitalize="off"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                {...field} // Spread field instead of using register directly
                                                onChange={(e) => {
                                                    field.onChange(e); // Call the default onChange to update the form state
                                                    setAccountExists(
                                                        recentAccountList.find(
                                                            (account) =>
                                                                account.username ===
                                                                e.target.value
                                                        ) || null
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
                                control={signInForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
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
                                disabled={!formState.isValid}
                            >
                                Sign In
                            </Button>
                        </form>
                    </Form>

                    <div className="pt-3 flex justify-center">
                        <div
                            className="flex cursor-pointer items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-secondary w-full"
                            onClick={handleCreateAccountClicked}
                        >
                            <div className="flex items-center justify-center">
                                <UserRoundPlusIcon />
                            </div>
                            <span className="uppercase text-center">
                                Create Account
                            </span>
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="recent">
                <RecentAccounts
                    recentAccounts={recentAccountList}
                    onSelectRecentAccount={handleSelectAccount}
                />
            </TabsContent>
        </Tabs>
    );
};

export default SignInPanel;
