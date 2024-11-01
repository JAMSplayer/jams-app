import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RecentAccount } from "@/types/recent-account";
import Avatar from "./Avatar";
import { formatAddress } from "@/lib/utils/address";

type RecentAccountsProps = {
    recentAccounts: RecentAccount[];
    onSelectRecentAccount: (recentAccount: RecentAccount) => void;
};

const RecentAccounts: React.FC<RecentAccountsProps> = ({
    recentAccounts,
    onSelectRecentAccount,
}) => {
    return (
        <ScrollArea className="h-[200px] w-full rounded-md border">
            {recentAccounts.map((recentAccount) => (
                <div
                    key={recentAccount.address}
                    className="flex items-center space-x-2 p-2  px-4 border-b border-muted cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => {
                        onSelectRecentAccount(recentAccount);
                    }}
                >
                    <div className="shrink-0">
                        <Avatar address={recentAccount.address} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <div className="font-medium">
                            {formatAddress(recentAccount.address)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {recentAccount.username}
                        </div>
                    </div>
                </div>
            ))}

            <ScrollBar orientation="vertical" className="bg-secondary" />
        </ScrollArea>
    );
};

export default RecentAccounts;
