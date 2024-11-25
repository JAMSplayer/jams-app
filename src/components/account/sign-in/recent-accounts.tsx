import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatAddress } from "@/lib/utils/address";
import { Label } from "@/components/ui/label";
import Avatar from "../avatar";
import { useEffect } from "react";
import { SimpleAccountUser } from "@/types/account-user";

type RecentAccountsProps = {
    recentAccounts: SimpleAccountUser[];
    onSelectRecentAccount: (recentAccount: SimpleAccountUser) => void;
};

const RecentAccounts: React.FC<RecentAccountsProps> = ({
    recentAccounts,
    onSelectRecentAccount,
}) => {
    return (
        <ScrollArea className="h-[200px] w-full rounded-md border">
            {recentAccounts.length > 0 ? (
                recentAccounts.map((recentAccount, _) => {
                    const username = recentAccount.username;
                    const address = recentAccount.address;

                    // If the address is invalid or empty, display the username instead
                    const displayAddress =
                        address && address !== "<error>"
                            ? formatAddress(address)
                            : null;

                    return (
                        <div
                            key={username} // Use username as the unique key
                            className="flex items-center space-x-2 p-2 px-4 border-b border-muted cursor-pointer hover:bg-secondary transition-colors duration-200"
                            onClick={() => onSelectRecentAccount(recentAccount)}
                        >
                            {address != "<error>" && (
                                <div className="shrink-0">
                                    {/* Show Avatar only if there's a valid address */}
                                    <Avatar
                                        address={displayAddress ? address : ""}
                                    />
                                </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                                <div className="font-medium">
                                    {/* Show formatted address or username */}
                                    {displayAddress || username}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {/* Always show the username */}
                                    {username}
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <Label className="text-md pt-8 flex justify-center">
                    No Recent Accounts Exist
                </Label>
            )}

            <ScrollBar orientation="vertical" className="bg-secondary" />
        </ScrollArea>
    );
};

export default RecentAccounts;
