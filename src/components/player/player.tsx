import { useEffect, useRef, useState } from "react";
import { useAudioPlayer } from "@/components/player/audio-provider";
import { ForwardButton } from "@/components/player/forward-button";
import { SoundButton } from "@/components/player/sound-button";
import { PlaybackRateButton } from "@/components/player/playback-rate-button";
import { PlayButton } from "@/components/player/play-button";
import { RewindButton } from "@/components/player/rewind-button";
import { Slider } from "@/components/player/slider";
import { ChevronDown } from "lucide-react";
import { usePlayerStore } from "@/store/player-store";

function parseTime(seconds: number) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = seconds - hours * 3600 - minutes * 60;
    return [hours, minutes, seconds];
}

function formatHumanTime(seconds: number) {
    let [h, m, s] = parseTime(seconds);
    return `${h} hour${h === 1 ? "" : "s"}, ${m} minute${
        m === 1 ? "" : "s"
    }, ${s} second${s === 1 ? "" : "s"}`;
}

const Player = () => {
    const player = useAudioPlayer();
    const { setPlayerVisibility, isPlayerVisible } = usePlayerStore();
    const wasPlayingRef = useRef(false);

    let [currentTime, setCurrentTime] = useState<number | null>(
        player.currentTime
    );

    useEffect(() => {
        setCurrentTime(null);
    }, [player.currentTime]);

    if (!player.song) {
        return null;
    }

    return (
        <div className="flex items-center gap-6 bg-card px-4 py-4 border-y md:px-6">
            <button
                onClick={() => {
                    setPlayerVisibility(false);
                }}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary focus:outline-none"
                aria-label="Minimize"
            >
                <ChevronDown className="h-4 w-4 text-primary" />
            </button>

            {/* Artwork on Medium and Above */}
            {player.song.picture && (
                <div
                    className={`hidden md:block absolute left-0 flex-shrink-0 overflow-hidden transition-all duration-500 ease-in-out ${
                        !isPlayerVisible ? "translate-y-5" : "translate-y-0"
                    }`}
                    style={{ height: "6.95rem", width: "6.75rem" }}
                >
                    <img
                        src={player.song.picture}
                        alt={player.song.title || "Album Art"}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="hidden md:block">
                <PlayButton player={player} />
            </div>
            <div className="mb-[env(safe-area-inset-bottom)] flex flex-1 flex-col gap-3  px-1">
                <div
                    className="truncate text-center text-sm font-bold leading-6 md:text-left pl-4"
                    title={player.song?.title}
                >
                    {player.song?.title}
                </div>
                <div className="flex justify-between gap-6 pl-4">
                    <div className="flex items-center md:hidden">
                        <SoundButton player={player} />
                    </div>
                    <div className="flex flex-none items-center gap-4">
                        <RewindButton player={player} />
                        <div className="md:hidden">
                            <PlayButton player={player} />
                        </div>
                        <ForwardButton player={player} />
                    </div>
                    <Slider
                        label="Current time"
                        maxValue={player.duration}
                        step={1}
                        value={[currentTime ?? player.currentTime]}
                        onChange={([value]) => setCurrentTime(value)}
                        onChangeEnd={([value]) => {
                            player.seek(value);
                            if (wasPlayingRef.current) {
                                player.play();
                            }
                        }}
                        numberFormatter={
                            { format: formatHumanTime } as Intl.NumberFormat
                        }
                        onChangeStart={() => {
                            wasPlayingRef.current = player.playing;
                            player.pause();
                        }}
                    />
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <PlaybackRateButton player={player} />
                        </div>
                        <div className="hidden items-center md:flex">
                            <SoundButton player={player} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;
