import { useState } from "react";
import { connect } from "@/backend/autonomi";
import { Button } from "./ui/button";
import { CableIcon, GlobeLockIcon, ZapOffIcon } from "lucide-react";
import { Input } from "./ui/input";
import { isValidPeerAddress } from "@/lib/utils/network";
import Networks from "@/enums/networks";

export default function DisconnectedPanel() {
    const [inputValue, setInputValue] = useState("");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            {/* Top section */}
            <div className="flex flex-col items-center">
                <ZapOffIcon size={50} />
                <p className="mt-6 text-gray-700 text-lg font-medium sm:text-xl/8 text-center flex items-center gap-2">
                    You are disconnected
                </p>
            </div>

            {/* Bottom section */}
            <div className="mt-12 w-full max-w-4xl flex flex-col sm:flex-row items-stretch justify-between border-t border-gray-200 pt-8">
                {/* Mainnet Section */}
                <div className="flex-1 flex flex-col items-center p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Mainnet
                    </h3>
                    <Button
                        onClick={() => {
                            const override = { network: Networks.MAINNET };
                            connect(override);
                        }}
                        className="w-full max-w-sm"
                    >
                        <span>Connect to Mainnet</span>
                        <GlobeLockIcon className="ml-2" />
                    </Button>
                </div>

                {/* Divider */}
                <div className="mx-4 w-px bg-gray-300 hidden sm:block" />

                {/* Testnet Section */}
                <div className="flex-1 flex flex-col items-center p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Testnet
                    </h3>
                    <Input
                        type="text"
                        placeholder="Enter Testnet Peer Address"
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
                        <span>Connect to Testnet</span>
                        <CableIcon className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
