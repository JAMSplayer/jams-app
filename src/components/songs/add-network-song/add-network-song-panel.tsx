import { useState } from "react";
import EnterXorname from "./enter-xorname";
import NetworkSongMetadataPanel from "./network-song-metadata";

const AddNetworkSongPanel = () => {
    const [activePanel, setActivePanel] = useState<
        "enter-xorname" | "network-song-metadata"
    >("enter-xorname");
    const [networkId, setNetworkId] = useState<string | null>(null);

    const handleSearch = (id: string) => {
        setNetworkId(id); // store the songs network ID
        setActivePanel("network-song-metadata"); // switch to the metadata panel
    };

    const handleReturn = () => {
        setActivePanel("enter-xorname"); // switch to the metadata panel
    };

    return (
        <div className="w-full">
            {activePanel === "enter-xorname" ? (
                <EnterXorname onSearch={handleSearch} />
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
