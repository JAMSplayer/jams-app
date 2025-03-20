import { type as osType } from "@tauri-apps/plugin-os";
import { generateLocation } from "@/lib/utils/location";
import { Song } from "@/types/songs/song";
import { createContext, useContext, useMemo, useReducer, useRef } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";

interface PlayerState {
    playing: boolean;
    muted: boolean;
    volume: number; // Track volume level
    duration: number;
    currentTime: number;
    song: Song | null;
}

interface PublicPlayerActions {
    play: (song?: Song) => void;
    pause: () => void;
    toggle: (song?: Song) => void;
    seekBy: (amount: number) => void;
    seek: (time: number) => void;
    playbackRate: (rate: number) => void;
    toggleMute: () => void;
    setVolume: (volume: number) => void; // Set volume level
    isPlaying: (song?: Song) => boolean;
}

export type PlayerAPI = PlayerState & PublicPlayerActions;

const enum ActionKind {
    SET_META = "SET_META",
    PLAY = "PLAY",
    PAUSE = "PAUSE",
    TOGGLE_MUTE = "TOGGLE_MUTE",
    SET_CURRENT_TIME = "SET_CURRENT_TIME",
    SET_DURATION = "SET_DURATION",
    SET_VOLUME = "SET_VOLUME", // Action for setting volume
}

type Action =
    | { type: ActionKind.SET_META; payload: Song }
    | { type: ActionKind.PLAY }
    | { type: ActionKind.PAUSE }
    | { type: ActionKind.TOGGLE_MUTE }
    | { type: ActionKind.SET_CURRENT_TIME; payload: number }
    | { type: ActionKind.SET_DURATION; payload: number }
    | { type: ActionKind.SET_VOLUME; payload: number }; // Volume action type

const AudioPlayerContext = createContext<PlayerAPI | null>(null);

function audioReducer(state: PlayerState, action: Action): PlayerState {
    switch (action.type) {
        case ActionKind.SET_META:
            return { ...state, song: action.payload };
        case ActionKind.PLAY:
            return { ...state, playing: true };
        case ActionKind.PAUSE:
            return { ...state, playing: false };
        case ActionKind.TOGGLE_MUTE:
            return { ...state, muted: !state.muted };
        case ActionKind.SET_CURRENT_TIME:
            return { ...state, currentTime: action.payload };
        case ActionKind.SET_DURATION:
            return { ...state, duration: action.payload };
        case ActionKind.SET_VOLUME:
            return { ...state, volume: action.payload };
    }
}
export function AudioProvider({ children }: { children: React.ReactNode }) {
    let [state, dispatch] = useReducer(audioReducer, {
        playing: false,
        muted: false,
        volume: 1,
        duration: 0,
        currentTime: 0,
        song: null,
    });

    let generatePlayableUrl = (location: string): string => {
        if (osType() == "linux") {
            return "http://localhost:12345/" + encodeURIComponent(location);
        } else {
            return convertFileSrc(location);
        }
    };

    let playerRef = useRef<HTMLAudioElement | null>(null);

    let actions = useMemo<PublicPlayerActions>(() => {
        return {
            play(song) {
                if (song) {
                    dispatch({ type: ActionKind.SET_META, payload: song });

                    if (!song.downloadFolder) {
                        console.log("download folder not supplied!");
                        return;
                    }
                    const filePath = generateLocation(
                        song.fileName,
                        song.extension,
                        song.downloadFolder
                    );
                    const playableURL = generatePlayableUrl(filePath);
                    console.log("URL: ", playableURL);
                    // If the song location changes, load the new song
                    if (
                        playerRef.current &&
                        playerRef.current.currentSrc !== playableURL
                    ) {
                        playerRef.current.src = playableURL;
                        playerRef.current.load();
                        playerRef.current.currentTime = 0;
                    }
                }

                playerRef.current?.play();
            },
            pause() {
                playerRef.current?.pause();
            },
            toggle(song) {
                if (song) {
                    // When a song is passed in
                    if (!song.downloadFolder) {
                        console.log("download folder not supplied!");
                        return;
                    }
                    const filePath = generateLocation(
                        song.fileName,
                        song.extension,
                        song.downloadFolder
                    );
                    const playableURL = generatePlayableUrl(filePath);
                    const isPlaying =
                        state.playing &&
                        playerRef.current?.currentSrc === playableURL;

                    if (isPlaying) {
                        this.pause();
                    } else {
                        this.play(song);
                    }
                } else {
                    // no song passed in, use state.song (current song in context)
                    if (state.song) {
                        const song = state.song; // get the current song from state
                        if (!song.downloadFolder) {
                            console.log("download folder not supplied!");
                            return;
                        }
                        const filePath = generateLocation(
                            song.fileName,
                            song.extension,
                            song.downloadFolder
                        );
                        const playableURL = generatePlayableUrl(filePath);
                        const isPlaying =
                            state.playing &&
                            playerRef.current?.currentSrc === playableURL;

                        if (isPlaying) {
                            this.pause();
                        } else {
                            this.play(song);
                        }
                    } else {
                        console.log("No song is currently loaded.");
                    }
                }
            },
            seekBy(amount) {
                if (playerRef.current) {
                    playerRef.current.currentTime += amount;
                }
            },
            seek(time) {
                if (playerRef.current) {
                    playerRef.current.currentTime = time;
                }
            },
            playbackRate(rate) {
                if (playerRef.current) {
                    playerRef.current.playbackRate = rate;
                }
            },
            toggleMute() {
                dispatch({ type: ActionKind.TOGGLE_MUTE });
            },
            setVolume(volume) {
                if (playerRef.current) {
                    playerRef.current.volume = Math.min(Math.max(volume, 0), 1);
                    dispatch({ type: ActionKind.SET_VOLUME, payload: volume });
                }
            },
            isPlaying(song) {
                if (song) {
                    if (!song.downloadFolder) {
                        console.log("download folder not supplied!");
                        return false; // return false if no download folder is provided
                    }
                    const filePath = generateLocation(
                        song.fileName,
                        song.extension,
                        song.downloadFolder
                    );
                    const playableURL = generatePlayableUrl(filePath);

                    return (
                        playerRef.current?.currentSrc === playableURL &&
                        state.playing
                    );
                }
                return false; // default return value for undefined song
            },
        };
    }, [state.playing, state.song]);

    let api = useMemo<PlayerAPI>(
        () => ({ ...state, ...actions }),
        [state, actions]
    );

    return (
        <>
            <AudioPlayerContext.Provider value={api}>
                {children}
            </AudioPlayerContext.Provider>
            <audio
                ref={playerRef}
                onPlay={() => dispatch({ type: ActionKind.PLAY })}
                onPause={() => dispatch({ type: ActionKind.PAUSE })}
                onTimeUpdate={(event) => {
                    dispatch({
                        type: ActionKind.SET_CURRENT_TIME,
                        payload: Math.floor(event.currentTarget.currentTime),
                    });
                }}
                onDurationChange={(event) => {
                    dispatch({
                        type: ActionKind.SET_DURATION,
                        payload: Math.floor(event.currentTarget.duration),
                    });
                }}
                muted={state.muted}
            />
        </>
    );
}
export function useAudioPlayer() {
    const player = useContext(AudioPlayerContext);

    if (!player) {
        console.warn("AudioProvider is not available");
        return {
            playing: false,
            muted: false,
            volume: 1,
            duration: 0,
            currentTime: 0,
            song: null,
            play: () => {},
            pause: () => {},
            toggle: () => {},
            seekBy: () => {},
            seek: () => {},
            playbackRate: () => {},
            toggleMute: () => {},
            setVolume: () => {},
            isPlaying: () => false,
        } as PlayerAPI;
    }

    return player;
}
