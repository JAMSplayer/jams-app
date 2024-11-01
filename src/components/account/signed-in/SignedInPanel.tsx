import { formatAddress } from "@/lib/utils/address";
import { formatBalance } from "@/lib/utils/balance";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Copy } from "lucide-react";

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

    return (
        <div className="border-b border-dashed px-4 py-5 border-secondary">
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
