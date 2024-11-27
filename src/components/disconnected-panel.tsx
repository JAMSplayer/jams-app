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
        <div className="flex flex-col items-center justify-center min-h-screen">
            {/* Top section */}
            <ZapOffIcon size={50} />
            <p className="mt-8 text-pretty text-lg font-medium sm:text-xl/8 text-center flex items-center justify-center gap-2">
                You are disconnected
            </p>

            {/* Bottom section */}
            <div className="mt-12 w-3/4 flex items-center justify-between border-t pt-8">
                {/* Mainnet Section */}
                <div className="flex-1 flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">Mainnet</h3>
                    <Button
                        onClick={() => {
                            const override = {
                                network: Networks.MAINNET,
                            };
                            connect(override);
                        }}
                    >
                        Connect to Mainnet
                        <GlobeLockIcon />
                    </Button>
                </div>

                {/* Divider */}
                <div className="mx-4 h-full border-l border-gray-300" />

                {/* Testnet Section */}
                <div className="flex-1 flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">Testnet</h3>

                    <Input
                        type="text"
                        placeholder="Enter Testnet Peer Address"
                        className=" px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
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
                        className="mt-4"
                    >
                        Connect to Testnet
                        <CableIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
}
