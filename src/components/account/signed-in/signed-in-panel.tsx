import { formatAddress } from "@/lib/utils/address";
import { formatBalance } from "@/lib/utils/balance";
import { useClipboard } from "@/hooks/use-clipboard";
import { Copy } from "lucide-react";
import { balance as autonomiBalance } from "@/backend/autonomi";
import { useEffect, useState } from "react";

interface SignedInPanelProps {
    account: {
        username: string;
        address: string;
    };
}

const SignedInPanel: React.FC<SignedInPanelProps> = ({ account }) => {
    // ====================================================================================
    // Account / Balance Functionality
    // ====================================================================================

    const [balanceValue, setBalanceValue] = useState<string | null>(null);
    const { copyToClipboard } = useClipboard();

    useEffect(() => {
        // Fetch the balance asynchronously and update state
        const fetchBalance = async () => {
            try {
                const value = await autonomiBalance();
                setBalanceValue(value);
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        };

        fetchBalance();
    }, []);

    // Prepare address data once balanceValue is available
    const addressData = {
        symbol: "ANT",
        value: balanceValue,
        decimals: 18,
    };

    // Render the balance once it's available and properly formatted
    const balance =
        addressData.value !== null ? (
            `${addressData.symbol}: ${formatBalance(
                Number(addressData.value), // Convert value to a number for formatting
                addressData.decimals
            )}`
        ) : (
            <></>
        );

    return (
        <div className="flex flex-col w-full border-b border-dashed px-4 py-5 border-secondary">
            {account.username}
            <div className="flex w-full mt-3">
                <div className="flex-grow rounded-lg bg-secondary px-2 py-1 text-sm tracking-tighter">
                    {account && formatAddress(account.address)}
                </div>

                <div
                    title="Copy Address"
                    className="ml-2 flex cursor-pointer items-center transition"
                    onClick={() => {
                        if (account) {
                            console.log(account.address);
                            copyToClipboard(account.address);
                        }
                    }}
                >
                    <Copy className="h-auto w-3.5" />
                </div>
            </div>

            {account && (
                <div className="mt-3 px-1 font-sm uppercase tracking-wider">
                    {balance}
                </div>
            )}
        </div>
    );
};

export default SignedInPanel;
