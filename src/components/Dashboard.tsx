import { useConnection } from "@/providers/connection-provider";
import { SongLoadButton } from "./player/song-load-button";

export default function Dashboard() {
    const { isConnected, account } = useConnection();

    return (
        <div className="p-4 space-y-2">
            <div className="flex flex-row">
                <SongLoadButton
                    song={{
                        location:
                            "http://localhost:12345/08dbb205f5a5712e48551c0e437f07be304a5daadf20e07e8307e7f564fa9962823aacdc081a17136c4e09f82a29ac50dba22dbc898a41b5d68d4971dc9b62ad5d82ef0e5f9d7b2224eb285497489d4a__BegBlag.mp3",
                        title: "BegBlag",
                        artist: "BegBlag",
                        album: "undefined",
                        genre: "undefined",
                        year: "undefined",
                        tags: ["undefined"],
                    }}
                />
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
