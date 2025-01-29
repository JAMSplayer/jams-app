import { useState } from "react";
import { connect } from "@/backend/logic";
import { Button } from "./ui/button";
import { CableIcon, GlobeLockIcon, ZapOffIcon } from "lucide-react";
import { Input } from "./ui/input";
import { isValidPeerAddress } from "@/lib/utils/network";
import Networks from "@/enums/networks";
import { useTranslation } from "react-i18next";
import { useConnection } from "@/providers/connection-provider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DisconnectedPanel() {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState("");
    const { isConnecting, setIsConnecting } = useConnection();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            {/* Top section */}
            <div className="flex flex-col items-center">
                <ZapOffIcon size={50} />
                <p className="mt-6 text-gray-700 text-lg font-medium sm:text-xl/8 text-center flex items-center gap-2">
                    {t("youAreDisconnected")}
                </p>
            </div>

            {/* Bottom section */}
            <div className="mt-12 w-full max-w-4xl flex flex-col sm:flex-row items-stretch justify-between border-t border-gray-200 pt-8">
                {/* Mainnet Section */}
                <div className="flex-1 flex flex-col items-center p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {t("mainnet")}
                    </h3>
                    <Button
                        onClick={async () => {
                            setIsConnecting(true);

                            try {
                                const override = { network: Networks.MAINNET };
                                await connect(override);
                            } catch (error) {
                                console.error("Error connecting:", error);
                            } finally {
                                setIsConnecting(false); // always reset the state
                            }
                        }}
                        className="w-full max-w-sm"
                        disabled={isConnecting}
                    >
                        {isConnecting ? (
                            <span className="inline-flex items-center gap-x-2">
                                Connecting <LoadingSpinner />
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-x-2">
                                {t("connectToMainnet")} <GlobeLockIcon />
                            </span>
                        )}
                    </Button>
                </div>

                {/* Divider */}
                <div className="mx-4 w-px bg-gray-300 hidden sm:block" />

                {/* Testnet Section */}
                <div className="flex-1 flex flex-col items-center p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {t("testnet")}
                    </h3>
                    <Input
                        type="text"
                        placeholder={t("enterTestnetPeerAddress")}
                        className="w-full max-w-sm px-4 py-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Button
                        onClick={() => {
                            const override = {
                                network: Networks.TESTNET,
                                peer: inputValue,
                            };
                            connect(override);
                        }}
                        disabled={!isValidPeerAddress(inputValue)}
                        className="w-full max-w-sm mt-4"
                    >
                        <span>{t("connectToTestnet")}</span>
                        <CableIcon className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
