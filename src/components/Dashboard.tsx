import { SongLoadButton } from "./player/song-load-button";

export default function Dashboard() {
    return (
        <div className="p-4 space-x-2">
            <SongLoadButton
                song={{
                    location: "./no-copyright-sample.mp3",
                    title: "song-1",
                }}
            />
        </div>
    );
}
