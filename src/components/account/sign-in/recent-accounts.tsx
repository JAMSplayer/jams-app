import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatAddress } from "@/lib/utils/address";
import { Label } from "@/components/ui/label";
import Avatar from "../avatar";
import { SimpleAccountUser } from "@/types/account-user";
import { useTranslation } from "react-i18next";
import { TrashIcon } from "lucide-react";

type RecentAccountsProps = {
    recentAccounts: SimpleAccountUser[];
    onSelectRecentAccount: (recentAccount: SimpleAccountUser) => void;
    deleteSelectedAccount: (username: string) => void;
};

const RecentAccounts: React.FC<RecentAccountsProps> = ({
    recentAccounts,
    onSelectRecentAccount,
    deleteSelectedAccount,
}) => {
    const { t } = useTranslation();

    return (
        <ScrollArea className="h-[200px] w-full rounded-md border">
            {recentAccounts.length > 0 ? (
                recentAccounts.map((recentAccount, _) => {
                    const username = recentAccount.username;
                    const address = recentAccount.address;

                    const displayAddress =
                        address && address !== "<error>"
                            ? formatAddress(address)
                            : null;

                    return (
                        <div
                            key={username}
                            className="flex items-center justify-between space-x-2 p-2 px-4 border-b border-muted cursor-pointer hover:bg-secondary transition-colors duration-200"
                        >
                            <div
                                className="flex items-center space-x-2"
                                onClick={() =>
                                    onSelectRecentAccount(recentAccount)
                                }
                            >
                                {address !== "<error>" && (
                                    <div className="shrink-0">
                                        <Avatar
                                            address={
                                                displayAddress ? address : ""
                                            }
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col overflow-hidden">
                                    <div className="font-medium">
                                        {displayAddress || username}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {username}
                                    </div>
                                </div>
                            </div>
                            {/* Delete Button */}
                            <button
                                type="button"
                                className="ml-2 p-2 bg-red-500 hover:bg-red-700 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSelectedAccount(username);
                                }}
                                title={t("deleteAccount")}
                            >
                                <TrashIcon className="h-5 w-5 text-muted" />
                            </button>
                        </div>
                    );
                })
            ) : (
                <Label className="text-md pt-8 flex justify-center">
                    {t("noRecentAccountsExist")}
                </Label>
            )}

            <ScrollBar orientation="vertical" className="bg-secondary" />
        </ScrollArea>
    );
};

export default RecentAccounts;
