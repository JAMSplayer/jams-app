import { useRef } from "react";
import {
    mergeProps,
    useFocusRing,
    useSlider,
    useSliderThumb,
    VisuallyHidden,
} from "react-aria";
import {
    type SliderState,
    type SliderStateOptions,
    useSliderState,
} from "react-stately";
import clsx from "clsx";

function parseTime(seconds: number) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = seconds - hours * 3600 - minutes * 60;
    return [hours, minutes, seconds];
}

function Thumb(props: {
    index: number;
    state: SliderState;
    trackRef: React.RefObject<React.ElementRef<"div">>;
    isFocusVisible: boolean;
    focusProps: ReturnType<typeof useFocusRing>["focusProps"];
    onChangeStart?: () => void;
}) {
    let { state, trackRef, focusProps, isFocusVisible, index } = props;
    let inputRef = useRef<React.ElementRef<"input">>(null);
    let { thumbProps, inputProps } = useSliderThumb(
        { index, trackRef, inputRef },
        state
    );

    return (
        <div
            className="absolute top-1/2 -translate-x-1/2"
            style={{
                left: `${state.getThumbPercent(index) * 100}%`,
            }}
        >
            <div
                {...thumbProps}
                onMouseDown={(...args) => {
                    thumbProps.onMouseDown?.(...args);
                    props.onChangeStart?.();
                }}
                onPointerDown={(...args) => {
                    thumbProps.onPointerDown?.(...args);
                    props.onChangeStart?.();
                }}
                className={clsx(
                    "h-4 rounded-full hidden md:block",
                    isFocusVisible || state.isThumbDragging(index)
                        ? "w-1.5 bg-primary/80"
                        : "w-1 bg-primary"
                )}
            >
                <VisuallyHidden>
                    <input
                        ref={inputRef}
                        {...mergeProps(inputProps, focusProps)}
                    />
                </VisuallyHidden>
            </div>
        </div>
    );
}

export function Slider(
    props: SliderStateOptions<Array<number>> & { onChangeStart?: () => void }
) {
    let trackRef = useRef<React.ElementRef<"div">>(null);
    let state = useSliderState(props);
    let { groupProps, trackProps, labelProps, outputProps } = useSlider(
        props,
        state,
        trackRef
    );
    let { focusProps, isFocusVisible } = useFocusRing();

    let currentTime = parseTime(state.getThumbValue(0));
    let totalTime = parseTime(state.getThumbMaxValue(0));

    function formatClockTime([h, m, s]: number[]) {
        const mm = String(h * 60 + m).padStart(2, "0");
        const ss = String(s).padStart(2, "0");
        return `${mm}:${ss}`;
    }

    return (
        <div
            {...groupProps}
            className="absolute inset-x-0 bottom-full flex flex-auto touch-none items-center gap-6 md:relative"
        >
            {props.label && (
                <label className="sr-only" {...labelProps}>
                    {props.label}
                </label>
            )}
            <div
                {...trackProps}
                onMouseDown={(...args) => {
                    trackProps.onMouseDown?.(...args);
                    props.onChangeStart?.();
                }}
                onPointerDown={(...args) => {
                    trackProps.onPointerDown?.(...args);
                    props.onChangeStart?.();
                }}
                ref={trackRef}
                className="relative w-full bg-secondary md:rounded-full"
            >
                <div
                    className={clsx(
                        "h-2 md:rounded-l-xl md:rounded-r-md",
                        isFocusVisible || state.isThumbDragging(0)
                            ? "bg-primary/80"
                            : "bg-primary"
                    )}
                    style={{
                        width:
                            state.getThumbValue(0) === 0
                                ? 0
                                : `calc(${state.getThumbPercent(0) * 100}% - ${
                                      isFocusVisible || state.isThumbDragging(0)
                                          ? "0.25rem"
                                          : "0.20rem"
                                  })`,
                    }}
                />
                <Thumb
                    index={0}
                    state={state}
                    trackRef={trackRef}
                    onChangeStart={props.onChangeStart}
                    focusProps={focusProps}
                    isFocusVisible={isFocusVisible}
                />
            </div>
            <div className="hidden items-center gap-2 md:flex">
                <output
                    {...outputProps}
                    aria-live="off"
                    className={clsx(
                        "hidden rounded-md px-1 py-0.5 font-mono text-sm leading-6 md:block",
                        state.getThumbMaxValue(0) === 0 && "opacity-0",
                        isFocusVisible || state.isThumbDragging(0)
                            ? "bg-primary text-background"
                            : "text-primary"
                    )}
                >
                    {formatClockTime(currentTime)}
                </output>
                <span
                    className="text-sm leading-6 text-primary"
                    aria-hidden="true"
                >
                    /
                </span>
                <span
                    className={clsx(
                        "hidden rounded-md px-1 py-0.5 font-mono text-sm leading-6 text-primary0 md:block",
                        state.getThumbMaxValue(0) === 0 && "opacity-0"
                    )}
                >
                    {formatClockTime(totalTime)}
                </span>
            </div>
        </div>
    );
}
