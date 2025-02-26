import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidXorname } from "@/lib/utils/validation";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { NetworkFileDetail } from "@/types/network-file-detail";
import { download } from "@/backend/logic";

interface EnterXornameProps {
    onSearchSuccess: (fileDetail: NetworkFileDetail) => void;
}

const EnterXorname: React.FC<EnterXornameProps> = ({ onSearchSuccess }) => {
    const [xorname, setXorname] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setXorname(value);
        setIsValid(isValidXorname(value));
        setErrorMessage(null);
    };

    const handleSearch = async () => {
        if (!isValid) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const fileDetail = await download(xorname);
            console.log("fileDetail: ", fileDetail);

            if (!fileDetail) {
                console.error("File metadata not found.");
                return;
            }

            // valid FileDetail
            onSearchSuccess(fileDetail);
        } catch (error) {
            console.error("Download failed:", error);
            setErrorMessage("Failed to fetch file metadata.");
        } finally {
            setIsLoading(false);
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
                        value={xorname}
                        onChange={handleInputChange}
                        placeholder="Enter Song Network ID"
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? "Searching..." : "Search"}{" "}
                        <MagnifyingGlassIcon />
                    </Button>
                </div>
                {errorMessage && (
                    <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                )}
            </div>
        </div>
    );
};

export default EnterXorname;
