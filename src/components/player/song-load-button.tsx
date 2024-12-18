import { useAudioPlayer } from "@/components/player/audio-provider";
import { Song } from "@/types/songs/song";
import { Button } from "../ui/button";
import { usePlayerStore } from "@/store/player-store";
import { useTranslation } from "react-i18next";

export function SongLoadButton({
    song,
}: React.ComponentPropsWithoutRef<"button"> & {
    song: Song;
}) {
    const { t } = useTranslation();
    let player = useAudioPlayer();
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
            {t("loadSong")}
        </Button>
    );
}
