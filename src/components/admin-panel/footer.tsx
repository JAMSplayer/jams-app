import Player from "../player/player";
import { usePlayerStore } from "@/store/player-store";
import { motion, AnimatePresence } from "motion/react";

const accordionVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1 },
};

export function Footer() {
    const { isPlayerVisible, hasLoaded, setPlayerVisibility } =
        usePlayerStore();

    return (
        <div className="relative w-full bg-background h-16 border-t border-primary-foreground">
            <div className="mx-4 md:mx-8 flex h-full items-center justify-between relative">
                <div className="text-xs md:text-sm leading-loose text-muted-foreground">
                    Powered by{" "}
                    <a
                        href="https://autonomi.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        Autonomi
                    </a>
                    .
                </div>

                {!isPlayerVisible && hasLoaded && (
                    <button
                        onClick={() => {
                            setPlayerVisibility(true);
                        }}
                        className="absolute top-0 right-0 translate-y-[0%] flex items-center justify-center w-10 h-5 bg-background rounded-b-lg border-x border-b hover:bg-primary-foreground"
                    >
                        <span className="text-sm text-primary">▲</span>
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isPlayerVisible && hasLoaded && (
                    <motion.div
                        className="overflow-hidden absolute bottom-16 w-full left-0 z-10"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={accordionVariants}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        <Player />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
