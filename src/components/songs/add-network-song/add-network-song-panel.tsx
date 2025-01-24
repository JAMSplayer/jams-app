import { useState } from "react";
import EnterNetworkID from "./enter-network-id";
import NetworkSongMetadataPanel from "./network-song-metadata";

const AddNetworkSongPanel = () => {
    const [activePanel, setActivePanel] = useState<
        "enter-network-id" | "network-song-metadata"
    >("enter-network-id");
    const [networkId, setNetworkId] = useState<string | null>(null);

    const handleSearch = (id: string) => {
        setNetworkId(id); // store the songs network ID
        setActivePanel("network-song-metadata"); // switch to the metadata panel
    };

    const handleReturn = () => {
        setActivePanel("enter-network-id"); // switch to the metadata panel
    };

    return (
        <div className="w-full">
            {activePanel === "enter-network-id" ? (
                <EnterNetworkID onSearch={handleSearch} />
            ) : (
                <NetworkSongMetadataPanel
                    id={networkId}
                    onReturn={handleReturn}
                />
            )}
        </div>
    );
};

export default AddNetworkSongPanel;
