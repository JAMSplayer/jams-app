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
import { FileDetail } from "@/types/file-detail"; // Replace with the actual path for FileMeta type
import { formatBytes } from "@/lib/utils/formatting";

interface MultipleFilePanelProps {
    onBack: () => void;
    fileDetails: FileDetail[]; // List of file details
}

export default function MultipleFilePanel({
    onBack,
    fileDetails,
}: MultipleFilePanelProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [minimizedStates, setMinimizedStates] = useState(
        fileDetails.map(() => false) // Initialize all as not minimized
    );

    // Handlers for pagination
    const handleNavigate = (direction: "prev" | "next") => {
        if (direction === "prev" && currentIndex > 0) {
            setCurrentIndex((prevIndex) => prevIndex - 1);
        } else if (
            direction === "next" &&
            currentIndex < fileDetails.length - 1
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
                {fileDetails.length > 1 && (
                    <div className="flex items-center space-x-2">
                        {/* Pagination Controls */}
                        <Button
                            variant="ghost"
                            onClick={() => handleNavigate("prev")}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeftIcon />
                        </Button>
                        <span className="text-sm text-primary">
                            {currentIndex + 1} / {fileDetails.length}
                        </span>
                        <Button
                            variant="ghost"
                            onClick={() => handleNavigate("next")}
                            disabled={currentIndex === fileDetails.length - 1}
                        >
                            <ChevronRightIcon />
                        </Button>
                    </div>
                )}
                <Button size={"sm"} className="mr-3">
                    Upload All <UploadIcon />
                </Button>
            </div>

            {/* Information Card */}
            <div className="px-4 pt-4">
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
                        {fileDetails[currentIndex].name && (
                            <p className="text-sm text-gray-500 mb-1">
                                Name: {fileDetails[currentIndex].name}
                            </p>
                        )}
                        {fileDetails[currentIndex].location && (
                            <p className="text-sm text-gray-500 mb-1">
                                Location: {fileDetails[currentIndex].location}
                            </p>
                        )}
                        {fileDetails[currentIndex].size && (
                            <p className="text-sm text-gray-500 mb-1">
                                Size:{" "}
                                {fileDetails.length > 0 &&
                                    fileDetails[currentIndex]?.size !== null &&
                                    fileDetails[currentIndex]?.size !==
                                        undefined &&
                                    formatBytes(fileDetails[currentIndex].size)}
                            </p>
                        )}
                        {fileDetails[currentIndex].extension && (
                            <p className="text-sm text-gray-500">
                                Extension: {fileDetails[currentIndex].extension}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Customize Card */}
            <div className="p-4">
                <div
                    className={`bg-background text-primary px-4 py-2 rounded-t-lg border border-secondary flex justify-between items-center`}
                >
                    <h1 className="text-lg font-bold">Customize</h1>
                </div>
                <div className="border border-t-0 rounded-b-lg p-4 bg-background border-secondary">
                    <p className="text-sm text-gray-500 mb-1">Coming Soon</p>
                </div>
            </div>
        </div>
    );
}
