import { type PlayerAPI } from "@/components/player/audio-provider";
import { PauseIcon } from "@/components/player/icons/pause-icon";
import { PlayIcon } from "@/components/player/icons/play-icon";

export function PlayButton({ player }: { player: PlayerAPI }) {
    let Icon = player.playing ? PauseIcon : PlayIcon;

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    player.toggle();
                }}
                aria-label={player.playing ? "Pause" : "Play"}
                className="group relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 md:h-14 md:w-14"
            >
                <Icon className="h-5 w-5 fill-card group-active:fill-card/80 md:h-7 md:w-7" />
            </button>
        </>
    );
}
