import { useConnection } from "@/providers/connection-provider";
import { SongLoadButton } from "./player/song-load-button";
import { Button } from "./ui/button";
import { logLevel } from "@/backend/autonomi";
import { registeredAccounts } from "@/backend/logic";
import { useStorage } from "@/providers/storage-provider";

export default function Dashboard() {
    const { isConnected, account } = useConnection();

    const { store } = useStorage();

    return (
        <div className="p-4 space-y-2">
            <div className="flex flex-row">
                <SongLoadButton
                    song={async () => {
                        if (!store) {
                            throw new Error("Store is not initialized.");
                        }

                        const defaultDownloadFolder = await store.get<{
                            value: string;
                        }>("download-folder");

                        if (
                            !defaultDownloadFolder ||
                            !defaultDownloadFolder.value
                        ) {
                            throw new Error(
                                "No default download folder found."
                            );
                        }

                        return {
                            id: "123",
                            xorname: "124",
                            downloadFolder: defaultDownloadFolder.value,
                            fileName: "wow",
                            extension: "mp3",
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
            <div>
                <Button
                    onClick={async () => {
                        await logLevel("ERROR");
                    }}
                >
                    {" "}
                    log: ERROR{" "}
                </Button>
                <Button
                    onClick={async () => {
                        await logLevel("INFO");
                    }}
                >
                    {" "}
                    log: INFO{" "}
                </Button>
                <Button
                    onClick={async () => {
                        await logLevel("TRACE");
                    }}
                >
                    {" "}
                    log: TRACE{" "}
                </Button>
            </div>
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
