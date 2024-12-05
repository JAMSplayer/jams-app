import { Button } from "@/components/ui/button";
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    UploadIcon,
} from "lucide-react";
import { useState } from "react";
import { FileMeta } from "@/types/file-meta"; // Replace with the actual path for FileMeta type
import { formatBytes } from "@/lib/utils/formatting";

interface MultipleFilePanelProps {
    onBack: () => void;
    fileMetas: FileMeta[]; // List of file metadata
}

export default function MultipleFilePanel({
    onBack,
    fileMetas,
}: MultipleFilePanelProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [minimizedStates, setMinimizedStates] = useState(
        fileMetas.map(() => false) // Initialize all as not minimized
    );

    // Handlers for pagination
    const handleNavigate = (direction: "prev" | "next") => {
        if (direction === "prev" && currentIndex > 0) {
            setCurrentIndex((prevIndex) => prevIndex - 1);
        } else if (
            direction === "next" &&
            currentIndex < fileMetas.length - 1
        ) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    };

    // Toggle minimize state for the current file
    const toggleMinimize = () => {
        setMinimizedStates((prevStates) =>
            prevStates.map((state, index) =>
                index === currentIndex ? !state : state
            )
        );
    };

    const isMinimized = minimizedStates[currentIndex];

    return (
        <div>
            {/* Header */}
            <div className="w-full sticky top-[3.5rem] bg-background z-50 border-b border-t border-secondary p-2 border-l flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {/* Back Button */}
                    <Button variant={"ghost"} onClick={onBack}>
                        <ArrowLeftIcon size={20} />
                    </Button>
                </div>
                {fileMetas.length > 1 && (
                    <div className="flex items-center space-x-2">
                        {/* Pagination Controls */}
                        <Button
                            variant="ghost"
                            onClick={() => handleNavigate("prev")}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeftIcon size={20} />
                        </Button>
                        <span className="text-sm text-primary">
                            {currentIndex + 1} / {fileMetas.length}
                        </span>
                        <Button
                            variant="ghost"
                            onClick={() => handleNavigate("next")}
                            disabled={currentIndex === fileMetas.length - 1}
                        >
                            <ChevronRightIcon size={20} />
                        </Button>
                    </div>
                )}
                <Button>
                    Upload <UploadIcon size={20} />
                </Button>
            </div>

            {/* Information Card */}
            <div className="p-4">
                <div
                    className={`bg-background text-primary px-4 py-2 ${
                        isMinimized ? "rounded-lg" : "rounded-t-lg"
                    } border border-secondary flex justify-between items-center`}
                >
                    <h1 className="text-lg font-bold">Information</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMinimize}
                        aria-label={isMinimized ? "Expand" : "Minimize"}
                    >
                        {isMinimized ? (
                            <ChevronDownIcon className="w-5 h-5" />
                        ) : (
                            <ChevronUpIcon className="w-5 h-5" />
                        )}
                    </Button>
                </div>
                {!isMinimized && (
                    <div className="border border-t-0 rounded-b-lg p-4 bg-background border-secondary">
                        <p className="text-sm text-gray-500 mb-1">
                            Name: {fileMetas[currentIndex].name}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">
                            Location: {fileMetas[currentIndex].location}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">
                            Size:{" "}
                            {fileMetas.length > 0 &&
                            fileMetas[currentIndex]?.size !== null
                                ? formatBytes(fileMetas[currentIndex].size)
                                : "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                            Extension: {fileMetas[currentIndex].extension}
                        </p>
                    </div>
                )}
            </div>

            {/* Meta Card */}
            <div className="p-4">
                <div
                    className={`bg-background text-primary px-4 py-2 rounded-t-lg border border-secondary flex justify-between items-center`}
                >
                    <h1 className="text-lg font-bold">File Meta</h1>
                </div>
                <div className="border border-t-0 rounded-b-lg p-4 bg-background border-secondary">
                    <p className="text-sm text-gray-500 mb-1">
                        Name: {fileMetas[currentIndex].name}
                    </p>
                </div>
            </div>
        </div>
    );
}
