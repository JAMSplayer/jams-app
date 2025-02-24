import { useState } from "react";
import EnterXorname from "./enter-xorname";
import NetworkSongMetadataPanel from "./network-song-metadata";
import { FileDetail } from "@/types/file-detail";

const AddNetworkSongPanel = () => {
    const [activePanel, setActivePanel] = useState<
        "enter-xorname" | "network-song-metadata"
    >("enter-xorname");
    const [fileDetail, setFileDetail] = useState<FileDetail | null>(null);

    const handleSearchSuccess = (fileDetail: FileDetail) => {
        setFileDetail(fileDetail);
        setActivePanel("network-song-metadata"); // switch to the metadata panel
    };

    const handleReturn = () => {
        setActivePanel("enter-xorname"); // switch to the metadata panel
        setFileDetail(null);
    };

    return (
        <div className="w-full">
            {activePanel === "enter-xorname" ? (
                <EnterXorname onSearchSuccess={handleSearchSuccess} />
            ) : (
                <NetworkSongMetadataPanel
                    fileDetail={fileDetail}
                    onReturn={handleReturn}
                />
            )}
        </div>
    );
};

export default AddNetworkSongPanel;
