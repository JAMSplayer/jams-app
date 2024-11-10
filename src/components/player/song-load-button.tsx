import { useAudioPlayer } from "@/components/player/audio-provider";
import { Song } from "@/types/song";
import { Button } from "../ui/button";
import { usePlayerStore } from "@/store/player-store";

export function SongLoadButton({
    song,
}: React.ComponentPropsWithoutRef<"button"> & {
    song: Song;
}) {
    let player = useAudioPlayer(song);
    const { setPlayerVisibility, setHasLoaded } = usePlayerStore();

    return (
        <Button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPlayerVisibility(true);
                setHasLoaded(true);
                player.play(song);
            }}
        >
            Load Song
        </Button>
    );
}
