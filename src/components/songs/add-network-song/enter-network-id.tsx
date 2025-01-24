import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidXorname } from "@/lib/utils/validation";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useState } from "react";

interface EnterNetworkIDProps {
    onSearch: (id: string) => void;
}

const EnterNetworkID: React.FC<EnterNetworkIDProps> = ({ onSearch }) => {
    const [networkId, setNetworkId] = useState("");
    const [isValid, setIsValid] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNetworkId(value);
        setIsValid(isValidXorname(value));
    };

    const handleSearch = async () => {
        if (networkId.trim() !== "") {
            onSearch(networkId);
        }
    };

    return (
        <div className="flex items-center justify-center pt-32 p-4">
            <div className="text-center">
                <p className="mb-4 text-gray-600">
                    Please enter the songs network ID to proceed.
                </p>
                <div className="flex flex-row items-center space-x-2">
                    <Input
                        type="text"
                        value={networkId}
                        onChange={handleInputChange}
                        placeholder="Enter Song Network ID"
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={!isValid} // disable the button if the input is invalid
                    >
                        Search <MagnifyingGlassIcon />
                    </Button>
                </div>
                {!isValid && networkId && (
                    <p className="text-red-500 text-sm mt-2">
                        Please enter a valid 64-character network ID consisting
                        of lowercase letters and numbers.
                    </p>
                )}
            </div>
        </div>
    );
};

export default EnterNetworkID;
