import { Button } from "@/components/ui/button";
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    UploadIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatBytes } from "@/lib/utils/formatting";
import { useTranslation } from "react-i18next";
import { LocalFileDetail } from "@/types/local-file-detail";
import { generateLocation } from "@/lib/utils/location";

interface MultipleFilePanelProps {
    onBack: () => void;
    fileDetails: LocalFileDetail[]; // List of file details
}

export default function MultipleFilePanel({
    onBack,
    fileDetails,
}: MultipleFilePanelProps) {
    const { t } = useTranslation();
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
                    {t("uploadAll")} <UploadIcon />
                </Button>
            </div>

            {/* Information Card */}
            <div className="px-4 pt-4">
                <div
                    className={`bg-background text-primary px-4 py-2 ${
                        isMinimized ? "rounded-lg" : "rounded-t-lg"
                    } border border-secondary flex justify-between items-center`}
                >
                    <h1 className="text-lg font-bold">{t("information")}</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMinimize}
                        aria-label={isMinimized ? t("expand") : t("minimize")}
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
                        {fileDetails[currentIndex].fileName && (
                            <p className="text-sm text-gray-500 mb-1">
                                {t("name")}:{" "}
                                {fileDetails[currentIndex].fileName}
                            </p>
                        )}
                        <p className="text-sm text-gray-500 mb-1">
                            {t("location")}:{" "}
                            {generateLocation("", fileDetails[currentIndex].fileName, fileDetails[currentIndex].extension, fileDetails[currentIndex].folderPath)}
                        </p>
                        {fileDetails[currentIndex].size && (
                            <p className="text-sm text-gray-500 mb-1">
                                {t("size")}:{" "}
                                {fileDetails.length > 0 &&
                                    fileDetails[currentIndex]?.size !== null &&
                                    fileDetails[currentIndex]?.size !==
                                        undefined &&
                                    formatBytes(fileDetails[currentIndex].size)}
                            </p>
                        )}
                        {fileDetails[currentIndex].extension && (
                            <p className="text-sm text-gray-500">
                                {t("extension")}:{" "}
                                {fileDetails[currentIndex].extension}
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
                    <h1 className="text-lg font-bold">{t("customize")}</h1>
                </div>
                <div className="border border-t-0 rounded-b-lg p-4 bg-background border-secondary">
                    <p className="text-sm text-gray-500 mb-1">
                        {t("comingSoon")}
                    </p>
                </div>
            </div>
        </div>
    );
}
