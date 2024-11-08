import { type PlayerAPI } from "@/components/player/audio-provider";
import { VerticalSlider } from "../ui/vertical-slider";
import { useEffect, useRef, useState } from "react";

function MuteIcon({
    muted,
    ...props
}: React.ComponentPropsWithoutRef<"svg"> & {
    muted: boolean;
}) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {muted ? (
                <>
                    <path d="M12 6L8 10H6C5.44772 10 5 10.4477 5 11V13C5 13.5523 5.44772 14 6 14H8L12 18V6Z" />
                    <path d="M16 10L19 13" fill="none" />
                    <path d="M19 10L16 13" fill="none" />
                </>
            ) : (
                <>
                    <path d="M12 6L8 10H6C5.44772 10 5 10.4477 5 11V13C5 13.5523 5.44772 14 6 14H8L12 18V6Z" />
                    <path
                        d="M17 7C17 7 19 9 19 12C19 15 17 17 17 17"
                        fill="none"
                    />
                    <path
                        d="M15.5 10.5C15.5 10.5 16 10.9998 16 11.9999C16 13 15.5 13.5 15.5 13.5"
                        fill="none"
                    />
                </>
            )}
        </svg>
    );
}

export function SoundButton({ player }: { player: PlayerAPI }) {
    const [sliderValue, setSliderValue] = useState(player.volume * 100); // initialize with player volume
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null); // useRef to store the timeout ID

    // Sync player volume with sliderValue when it changes externally
    useEffect(() => {
        setSliderValue(Math.min(100, Math.max(0, player.volume * 100))); // Update slider when player volume changes
    }, [player.volume]);

    function scaleToOneDecimalPlace(value: number) {
        if (value < 0 || value > 100) {
            throw new Error("Value must be between 0 and 100.");
        }

        return Math.round((value / 100) * 10) / 10;
    }

    const [isHovering, setIsHovering] = useState(false);

    const handleMouseEnter = () => {
        // Cancel any ongoing timeout when the user re-enters before the time runs out
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }
        setIsHovering(true);
    };

    // hide the slider after 0.7 sec
    const handleMouseLeave = () => {
        hoverTimeout.current = setTimeout(() => {
            setIsHovering(false);
        }, 700);
    };

    return (
        <div
            className="relative group md:order-none"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Mute Button Icon */}
            <button
                type="button"
                onClick={() => player.toggleMute()}
                aria-label={player.muted ? "Unmute" : "Mute"}
                className="mt-1 h-6 w-6 fill-primary rounded-md hover:bg-primary focus:outline-none stroke-primary group-hover:fill-primary hover:fill-secondary hover:stroke-secondary hover:group-hover:fill-secondary"
            >
                <MuteIcon muted={player.muted} />
            </button>

            {/* Volume Slider - only visible on hover */}
            <div
                className={`absolute top-[-40px] left-1/2 transform -translate-x-1/2 ${
                    player.muted || !isHovering ? "hidden" : "group-hover:flex"
                } `}
            >
                <div className="h-10 w-2 bg-gray-300 rounded-lg">
                    <div className="h-full bg-gray-400 rounded-full">
                        <VerticalSlider
                            value={[sliderValue]}
                            onValueChange={([newValue]) => {
                                const newVolume =
                                    scaleToOneDecimalPlace(newValue);
                                player.setVolume(newVolume);
                                setSliderValue(newValue);
                            }}
                            max={100}
                            step={1}
                            orientation="vertical"
                            className="flex items-center h-full w-2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
