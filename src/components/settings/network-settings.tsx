import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";
import SubDividerLayout from "@/enums/sub-divider-layout";
import SubDivider from "./sub-divider";
import { useStorage } from "@/providers/storage-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import Networks from "@/enums/networks";
import { motion } from "framer-motion";
import { isValidPeerAddress } from "@/lib/utils/network";
import { useTranslation } from "react-i18next";

export default function StorageSettings() {
    const { t } = useTranslation();
    const { store } = useStorage();
    const [testnetPeerAddress, setTestnetPeerAddress] = useState<string | null>(
        null
    );
    const [selectedNetwork, setSelectedNetwork] = useState<Networks>(
        Networks.MAINNET
    );
    const [hasNetworkSelectionSubmitted, setHasNetworkSelectionSubmitted] =
        useState<boolean>(false);

    // Determine if the save button should be enabled based on validation
    const isSaveTestnetPeerAddressEnabled =
        testnetPeerAddress && isValidPeerAddress(testnetPeerAddress);

    useEffect(() => {
        async function loadSettings() {
            if (!store) {
                return;
            }

            try {
                const retrievedTestnetPeerAddress =
                    (await store.get<{ value: string }>(
                        "testnet-peer-address"
                    )) || null;
                setTestnetPeerAddress(retrievedTestnetPeerAddress?.value || "");
            } catch (err) {
                console.error(
                    "Failed to load testnet peer address setting",
                    err
                );
            }
        }

        loadSettings();
    }, [store]);

    // network selection -----------------------------------------------------------

    const FormSchema = z.object({
        type: z.enum(
            Object.values(Networks) as [Networks.MAINNET, Networks.TESTNET],
            {
                required_error: "You need to select a network.",
            }
        ),
    });

    const networkSelectionForm = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            type: Networks.MAINNET, // Default to mainnet initially
        },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            if (store) {
                // Save the selected network to storage
                await store.set("selected-network", data.type);
                await store.save();
            }

            // This initial check is to only show animation close section on user change network
            setHasNetworkSelectionSubmitted(true);

            // Update the state with the new selection
            setSelectedNetwork(data.type);

            // Show a success message
            toast(t("networkUpdated"), {
                description: t("youHaveUpdatedYourSelectedNetwork"),
            });
        } catch (error) {
            console.error("Failed to save network to storage:", error);
        }
    }

    // Load the saved network from storage on component mount
    useEffect(() => {
        const loadSavedNetwork = async () => {
            if (!store) return;

            try {
                const savedNetwork = await store.get<Networks>(
                    "selected-network"
                );
                if (savedNetwork) {
                    setSelectedNetwork(savedNetwork);
                    networkSelectionForm.setValue("type", savedNetwork); // Set form default to saved network
                } else {
                    setSelectedNetwork(Networks.MAINNET); // Default to mainnet if no saved value
                }
            } catch (error) {
                console.error("Failed to load network from storage:", error);
                setSelectedNetwork(Networks.MAINNET); // default to mainnet on error
            }
        };

        loadSavedNetwork();
    }, [store, networkSelectionForm]);

    const testnetSettingsArea = (
        <>
            <SubDivider
                title={t("testnetSettings")}
                layout={SubDividerLayout.DEFAULT}
            />
            <div className="p-4">
                <Label>{t("testnetPeerAddress")}</Label>
                <div className="flex-col space-y-4 mt-2">
                    <input
                        id="input"
                        type="text"
                        className="block w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t("enterTestnetPeerAddress")}
                        value={testnetPeerAddress || ""}
                        onChange={(e) => setTestnetPeerAddress(e.target.value)}
                    />
                    <Button
                        disabled={!isSaveTestnetPeerAddressEnabled} // Disable based on validation
                        onClick={async () => {
                            if (store && isSaveTestnetPeerAddressEnabled) {
                                await store.set("testnet-peer-address", {
                                    value: testnetPeerAddress,
                                });
                                await store.save();
                                toast(t("testnetPeerAddressUpdated"), {
                                    description: t(
                                        "yourTestnetPeerAddressHasBeenUpdated"
                                    ),
                                });
                            }
                        }}
                    >
                        {t("save")}
                    </Button>
                </div>
            </div>
        </>
    );

    return (
        <div className="items-center">
            <SubDivider
                title={t("networkSelection")}
                layout={SubDividerLayout.TOP}
            />

            <div className="p-4">
                <Form {...networkSelectionForm}>
                    <form
                        onSubmit={networkSelectionForm.handleSubmit(onSubmit)}
                        className="w-2/3 space-y-6"
                    >
                        <FormField
                            control={networkSelectionForm.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value} // Bind the value to the form field
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={Networks.MAINNET}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {t("mainnet")}
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={Networks.TESTNET}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {t("testnet")}
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">{t("update")}</Button>
                    </form>
                </Form>
            </div>

            {hasNetworkSelectionSubmitted ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                        opacity:
                            hasNetworkSelectionSubmitted &&
                            selectedNetwork === Networks.TESTNET
                                ? 1
                                : 0,
                        height:
                            hasNetworkSelectionSubmitted &&
                            selectedNetwork === Networks.TESTNET
                                ? "auto"
                                : 0,
                    }}
                    transition={{ duration: 1 }}
                    style={{ overflow: "hidden" }}
                >
                    {testnetSettingsArea}
                </motion.div>
            ) : null}

            {/* When hasNetworkSelectionSubmitted is false, show the static Testnet Settings section */}
            {!hasNetworkSelectionSubmitted &&
            selectedNetwork === Networks.TESTNET ? (
                <>{testnetSettingsArea}</>
            ) : null}
        </div>
    );
}
