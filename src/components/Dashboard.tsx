import { SongLoadButton } from "./player/song-load-button";

export default function Dashboard() {
    return (
        <div className="p-4 space-x-2">
            <SongLoadButton
                song={{
                    location:
                        "http://localhost:12345/3509bad03dc869dec883c7b44662c3503d2517fa9e828bb64f4dbe719d3837bf__BegBlag.mp3",
                    title: "song-1",
                }}
            />
        </div>
    );
}
