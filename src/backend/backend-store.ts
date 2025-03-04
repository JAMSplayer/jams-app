import { getExternalStore } from "@/providers/storage-provider";
import { downloadDir } from "@tauri-apps/api/path";

export const getSelectedNetwork = async () => {
    try {
        const store = await getExternalStore();
        const selectedNetwork = await store.get("selected-network");
        console.log("Selected Network:", selectedNetwork);
        return selectedNetwork;
    } catch (error) {
        console.error("Failed to fetch selected network:", error);
    }
};

export const getTestnetPeerAddress = async (): Promise<string | null> => {
    try {
        const store = await getExternalStore();

        // Get the selected network from the store
        const selectedNetwork = await store.get<string>("selected-network");

        if (selectedNetwork !== "mainnet") {
            // Get the testnet peer address if the network is not "mainnet"
            const testnetPeerAddress = await store.get<string>(
                "testnet-peer-address"
            );
            return testnetPeerAddress || null;
        }

        // Return null if the network is "mainnet"
        return null;
    } catch (error) {
        console.error("Failed to fetch testnet peer address:", error);
        return null;
    }
};

export const getDownloadFolder = async (): Promise<string | null> => {
    try {
        const store = await getExternalStore();
        const downloadFolder = await store.get<string>("download-folder");

        console.log("Download folder from store:", downloadFolder);
        if (downloadFolder) return downloadFolder;
    } catch (error) {
        console.error("Failed to fetch download folder from store:", error);
    }

    // fallback: try to get the systems default download folder
    try {
        const defaultDownloadFolder = await downloadDir();
        console.log("Using system download folder:", defaultDownloadFolder);
        return defaultDownloadFolder || null;
    } catch (e) {
        console.error("Error fetching system download folder:", e);
        return null;
    }
};
