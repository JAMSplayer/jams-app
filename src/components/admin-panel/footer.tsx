import Player from "../player/player";
import { usePlayerStore } from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";

const accordionVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1 },
};

export function Footer() {
    const { isPlayerVisible } = usePlayerStore();

    return (
        <div className="relative w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-4 md:mx-8 flex h-14 items-center justify-between">
                <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
                    Powered by{" "}
                    <a
                        href="https://github.com/JAMSplayer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        JAMS
                    </a>
                    .
                </p>
            </div>
            <AnimatePresence>
                {isPlayerVisible && (
                    <motion.div
                        className="overflow-hidden absolute bottom-14 w-full left-0 z-10"
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
