import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import SubDivider from "./sub-divider";
import SubDividerLayout from "@/enums/sub-divider-layout";
import { useStorage } from "@/providers/storage-provider";
import { useTranslation } from "react-i18next";

export default function NotificationSettings() {
    const { t } = useTranslation();

    const [alertChecked, setAlertChecked] = useState(false);
    const [infoChecked, setInfoChecked] = useState(false);
    const { store } = useStorage();
    const [isLoading, setIsLoading] = useState<boolean | null>(null);

    interface NotificationOptions {
        alert: "enabled" | "disabled";
        info: "enabled" | "disabled";
    }

    // Load the stored values when the store is ready
    useEffect(() => {
        async function loadSettings() {
            if (!store) {
                setIsLoading(false);
                return; // Check if the store is initialized
            }

            try {
                // Retrieve the "options" object from the store
                const storedOptions: NotificationOptions = (await store.get(
                    "options"
                )) || {
                    alert: "disabled",
                    info: "disabled",
                };

                // Set checkbox states based on the store values
                setAlertChecked(storedOptions.alert === "enabled");
                setInfoChecked(storedOptions.info === "enabled");
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setIsLoading(false);
            }
        }

        loadSettings(); // Load settings when store is initialized
    }, [store]); // Run when the store is set

    const handleNotificationChange = async (option: "alert" | "info") => {
        if (!store) return; // Ensure store is available

        // Toggle the corresponding state based on the option
        const isChecked = option === "alert" ? alertChecked : infoChecked;
        const setChecked =
            option === "alert" ? setAlertChecked : setInfoChecked;

        const newChecked = !isChecked;
        setChecked(newChecked);

        // Get the current stored options, or use default values
        const storedOptions: NotificationOptions = (await store.get(
            "options"
        )) || {
            alert: "disabled",
            info: "disabled",
        };

        // Update the store with the new value for the specified option
        const updatedOptions = {
            ...storedOptions,
            [option]: newChecked ? "enabled" : "disabled",
        };

        // Save the updated options back to the store
        await store.set("options", updatedOptions);
        await store.save();
    };

    return (
        <div className="items-center">
            <SubDivider
                title={t("notificationLevels")}
                layout={SubDividerLayout.TOP}
            />

            {isLoading !== null && !isLoading && (
                <div className="flex flex-col p-4">
                    <div className="flex flex-row">
                        <Checkbox
                            id="alert"
                            checked={alertChecked}
                            onCheckedChange={() =>
                                handleNotificationChange("alert")
                            }
                        />
                        <label
                            htmlFor="alert"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
                        >
                            {t("alert")}
                        </label>
                    </div>
                    <div className="flex flex-row pt-2">
                        <Checkbox
                            id="info"
                            checked={infoChecked}
                            onCheckedChange={() =>
                                handleNotificationChange("info")
                            }
                        />
                        <label
                            htmlFor="info"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
                        >
                            {t("info")}
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
