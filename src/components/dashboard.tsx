import { useConnection } from "@/providers/connection-provider";
import { SongLoadButton } from "./player/song-load-button";
import { Button } from "./ui/button";
import { registeredAccounts } from "@/backend/logic";
import { resolveResource } from "@tauri-apps/api/path";
import { extractFromFullPath } from "@/lib/utils/location";

export default function Dashboard() {
    const { isConnected, account } = useConnection();

    return (
        <div className="p-4 space-y-2">
            <div className="flex flex-row">
                <SongLoadButton
                    song={async () => {
                        const pathData = extractFromFullPath(
                            await resolveResource(
                                "resources/A_Lazy_Farmer_Boy_by_Buster_Carter_And_Preston_Young.mp3"
                            )
                        );
                        console.log("pathData: ", pathData);
                        const { fileName, extension, folderPath } = pathData;

                        return {
                            id: "123",
                            xorname: "124",
                            downloadFolder: folderPath,
                            fileName,
                            extension,
                            title: "BegBlag",
                            artist: "BegBlag",
                            dateCreated: new Date(),
                            picture: undefined,
                            tags: [],
                        };
                    }}
                />
            </div>
            <Button
                onClick={async () => {
                    // get recent accounts
                    const accounts = await registeredAccounts();
                    console.log("ACCOUNTS: ", accounts);
                }}
            >
                Get Accounts
            </Button>
            <div className="flex flex-col">
                <div>
                    <h1>
                        Network Status:{" "}
                        {isConnected ? "Connected" : "Disconnected"}
                    </h1>
                    {isConnected && account ? (
                        <div>
                            <h2>Account Information:</h2>
                            <p>Username: {account.username}</p>
                            <p>Address: {account.address}</p>
                        </div>
                    ) : (
                        <p>No account connected.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
