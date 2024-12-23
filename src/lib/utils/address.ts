import { ethers } from "ethers";

export const formatAddress = (address: string | undefined): string => {
    // Ensure address is a string, and handle undefined or null values
    if (!address || address.length <= 20) {
        return address || ""; // Return empty string if address is undefined or null
    }

    const start = address.slice(0, 10);
    const end = address.slice(-10);
    return `${start}...${end}`;
};

export const isEthereumAddress = (address: string): boolean => {
    return ethers.isAddress(address);
};
