import { Input } from "../../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { UserRoundPlusIcon } from "lucide-react";
import RecentAccounts from "./recent-accounts";
import { signIn as autonomiLogicSignIn } from "@/backend/logic";
import { registeredAccounts } from "@/backend/logic";
import { SimpleAccountUser } from "@/types/account-user";
import { useTranslation } from "react-i18next";
import { deleteAccount } from "@/backend/autonomi";

interface SignInPanelProps {
    onCreateAccountClicked: () => void;
    onRecoverAccountClicked: () => void;
}

const SignInPanel: React.FC<SignInPanelProps> = ({
    onCreateAccountClicked,
    onRecoverAccountClicked,
}) => {
    const { t } = useTranslation();

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
    const [accountExists, setAccountExists] =
        useState<SimpleAccountUser | null>(null);

    // ====================================================================================
    // Recent Accounts Functionality
    // ====================================================================================

    // Callback function to update the currently selected account from the RecentAccounts tab
    const handleSelectAccount = (recentAccount: SimpleAccountUser) => {
        // Find the account based on the selected recent account
        const foundAccount = recentAccountList.find(
            (account) => account.username === recentAccount.username
        );

        // Update accountExists state
        setAccountExists(foundAccount || null);

        // Check if foundAccount exists instead of accountExists
        if (!foundAccount) {
            toast(t("signInWarning"), {
                description: t("thisUsernameDoesNotExist"),
            });
        } else {
            // Set the username field in the form to the selected recent account's username
            setValue("username", recentAccount.username);
            // Set the active tab to sign-in
            setActiveTab("sign-in");
        }
    };

    const [recentAccountList, setRecentAccountList] = useState<
        SimpleAccountUser[]
    >([]);

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

    useEffect(() => {
        const fetchRecentAccounts = async () => {
            try {
                const accounts: SimpleAccountUser[] =
                    await registeredAccounts(); // Fetch accounts
                setRecentAccountList(accounts); // Set state with fetched accounts
            } catch (err) {
                console.log("Failed to fetch recent accounts");
            }
        };

        fetchRecentAccounts();
    }, []);

    const deleteSelectedAccount = (username: string) => {
        deleteAccount(username);
        setRecentAccountList((prevAccounts) =>
            prevAccounts.filter((account) => account.username !== username)
        );
        toast("Account Deleted", {
            description: `${username} has been deleted`,
        });
    };

    // (values: z.infer<typeof signInSchema>)
    const signIn = (values: z.infer<typeof signInSchema>) => {
        //  TODO
        const usernameExists = recentAccountList.some(
            (account) => account.username === username
        );

        if (!usernameExists) {
            toast(t("registerWarning"), {
                description: t("thisUsernameDoesNotExist"),
            });
        } else {
            autonomiLogicSignIn(values.username, values.password);
        }
    };

    const handleCreateAccountClicked = () => {
        onCreateAccountClicked();
    };

    const handleRecoverAccountClicked = () => {
        onRecoverAccountClicked();
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="flex w-full">
                <TabsTrigger value="sign-in" className="flex-1 text-center">
                    <span className="block w-full text-center">
                        {t("signIn")}
                    </span>
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex-1 text-center">
                    <span className="block w-full text-center">
                        {t("recent")}
                    </span>
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
                                        <FormLabel>{t("username")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    "enterYourUsername"
                                                )}
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
                                        <FormLabel>{t("password")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    "enterYourPassword"
                                                )}
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
                                {t("signIn")}
                            </Button>
                        </form>
                    </Form>

                    {/* Divider */}
                    <div className="flex items-center justify-center mt-4">
                        <div className="w-full border-t border-gray-300"></div>
                        <span className="px-3 text-sm text-gray-500">
                            {t("or")}
                        </span>
                        <div className="w-full border-t border-gray-300"></div>
                    </div>

                    <div className="pt-3 flex justify-center">
                        <Button
                            className="flex cursor-pointer items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-sidebar-foreground w-full"
                            onClick={handleCreateAccountClicked}
                        >
                            <div className="flex items-center justify-center">
                                <UserRoundPlusIcon />
                            </div>
                            <span className="uppercase text-center">
                                {t("createAccount")}
                            </span>
                        </Button>
                    </div>

                    <div className="flex justify-center mt-3">
                        <a
                            className="text-sm font-medium text-primary hover:underline hover:cursor-pointer"
                            onClick={handleRecoverAccountClicked}
                        >
                            {t("recoverExistingAccount")}
                        </a>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="recent">
                <RecentAccounts
                    recentAccounts={recentAccountList}
                    onSelectRecentAccount={handleSelectAccount}
                    deleteSelectedAccount={deleteSelectedAccount}
                />
            </TabsContent>
        </Tabs>
    );
};

export default SignInPanel;
