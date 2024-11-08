import { SongLoadButton } from "./player/song-load-button";
import { Button } from "./ui/button";
import { usePlayerStore } from "@/store/store";

export default function Dashboard() {
    const { isPlayerVisible, togglePlayerVisibility } = usePlayerStore();

    return (
        <div className="p-4 space-x-2">
            <Button onClick={togglePlayerVisibility}>
                {isPlayerVisible ? "Hide Player" : "Open Player"}
            </Button>

            <SongLoadButton
                song={{
                    location: "./no-copyright-sample.mp3",
                    title: "song-1",
                }}
            />
        </div>
    );
}
