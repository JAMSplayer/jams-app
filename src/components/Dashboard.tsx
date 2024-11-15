import { SongLoadButton } from "./player/song-load-button";

export default function Dashboard() {
    return (
        <div className="p-4 space-x-2">
            <SongLoadButton
                song={{
                    location:
                        "http://localhost:12345/08dbb205f5a5712e48551c0e437f07be304a5daadf20e07e8307e7f564fa9962823aacdc081a17136c4e09f82a29ac50dba22dbc898a41b5d68d4971dc9b62ad5d82ef0e5f9d7b2224eb285497489d4a__BegBlag.mp3",
                    title: "BegBlag",
                }}
            />
        </div>
    );
}
