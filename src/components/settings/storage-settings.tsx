import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { load, Store } from "@tauri-apps/plugin-store";
import * as path from "@tauri-apps/api/path";
import { Button } from "../ui/button";
import { FolderSearchIcon } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import SubDividerLayout from "@/enums/sub-divider-layout";
import SubDivider from "./sub-divider";

export default function StorageSettings() {
    const [store, setStore] = useState<Store | null>(null);
    const [downloadFolder, setDownloadFolder] = useState("");
    const [isLoading, setIsLoading] = useState<boolean | null>(null);

    // Initialize the store when the component mounts
    useEffect(() => {
        const initializeStore = async () => {
            try {
                const storeInstance = await load("store.bin", {
                    autoSave: true,
                });
                setStore(storeInstance); // Set the store instance
            } catch (error) {
                console.error("Failed to initialize store:", error);
                setIsLoading(false);
            }
        };

        initializeStore();
    }, []);

    useEffect(() => {
        async function loadSettings() {
            if (!store) {
                setIsLoading(false);
                return;
            }

            try {
                const downloadFolder = await store.get<{ value: string }>(
                    "download-folder"
                );

                const defaultDownloadsPath = await path.downloadDir();

                if (!downloadFolder || !downloadFolder.value) {
                    setDownloadFolder(defaultDownloadsPath); // Use default path if none is set
                } else {
                    setDownloadFolder(downloadFolder.value); // Set stored folder if it exists
                }
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setIsLoading(false);
            }
        }

        loadSettings(); // Load settings when store is initialized
    }, [store]); // Run when the store is set

    // directory browser to set new download location
    const handleBrowseClick = async () => {
        const selectedFolder = await open({
            multiple: false,
            directory: true,
        });

        if (selectedFolder) {
            setDownloadFolder(selectedFolder);
        }
    };

    return (
        <div className="items-center">
            <SubDivider title="Download" layout={SubDividerLayout.TOP} />
            {isLoading !== null && !isLoading && (
                <div className="p-4">
                    <Label htmlFor="location">Download Location</Label>
                    <div className="flex">
                        <button
                            type="button"
                            onClick={async () => {
                                await handleBrowseClick();
                            }}
                            className="hover:bg-accent hover:text-accent-foreground  py-2 px-4 border border-input inline-flex items-center justify-center whitespace-nowrap rounded-l-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                        >
                            <FolderSearchIcon size={20} className="mr-2" />
                            Select
                        </button>

                        {/* Right-side file input */}
                        <input
                            id="input"
                            type="text"
                            className="block w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="select download folder"
                            value={downloadFolder}
                            readOnly
                        />
                    </div>

                    <div className="flex justify-end py-2">
                        <Button
                            variant={"outline"}
                            size={"sm"}
                            onClick={async () => {
                                const defaultDownloadsPath =
                                    await path.downloadDir();
                                setDownloadFolder(defaultDownloadsPath);
                            }}
                            className="mr-2"
                        >
                            Default
                        </Button>

                        <Button
                            variant={"outline"}
                            size={"sm"}
                            onClick={async () => {
                                if (store) {
                                    await store.set("download-folder", {
                                        value: downloadFolder,
                                    });
                                    await store.save();
                                    toast("Download Folder Updated", {
                                        description:
                                            "Your download folder location has been updated.",
                                    });
                                }
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
