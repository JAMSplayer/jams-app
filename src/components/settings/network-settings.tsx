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

export default function StorageSettings() {
    const { store } = useStorage();
    const [testnetPeerAddress, setTestnetPeerAddress] = useState<string | null>(
        null
    );
    const [selectedNetwork, setSelectedNetwork] = useState<Networks>(
        Networks.MAINNET
    );
    const [hasNetworkSelectionSubmitted, setHasNetworkSelectionSubmitted] =
        useState<boolean>(false);

    // Validation function for network address
    const isValidNetworkAddress = (address: string): boolean => {
        const pattern =
            /^\/?ip4\/(\d{1,3}\.){3}\d{1,3}\/udp\/\d{1,5}\/quic-v1\/p2p\/[A-Za-z0-9]{52}\/?$/;
        return pattern.test(address);
    };

    // Determine if the save button should be enabled based on validation
    const isSaveTestnetPeerAddressEnabled =
        testnetPeerAddress && isValidNetworkAddress(testnetPeerAddress);

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
            toast("Network Updated", {
                description: "You have updated your selected network.",
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

    return (
        <div className="items-center">
            <SubDivider
                title="Network Selection"
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
                                                    mainnet
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={Networks.TESTNET}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    testnet
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </div>

            {hasNetworkSelectionSubmitted &&
            selectedNetwork === Networks.TESTNET ? (
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
                    <SubDivider
                        title="Testnet Settings"
                        layout={SubDividerLayout.DEFAULT}
                    />

                    <div className="p-4">
                        <Label>Testnet Peer Address</Label>
                        <div className="flex-col space-y-4 mt-2">
                            <input
                                id="input"
                                type="text"
                                className="block w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter testnet peer address"
                                value={testnetPeerAddress || ""}
                                onChange={(e) =>
                                    setTestnetPeerAddress(e.target.value)
                                }
                            />
                            <Button
                                disabled={!isSaveTestnetPeerAddressEnabled} // Disable based on validation
                                onClick={async () => {
                                    if (
                                        store &&
                                        isSaveTestnetPeerAddressEnabled
                                    ) {
                                        await store.set(
                                            "testnet-peer-address",
                                            { value: testnetPeerAddress }
                                        );
                                        await store.save();
                                        toast("Testnet Peer Address Updated", {
                                            description:
                                                "Your testnet peer address has been updated.",
                                        });
                                    }
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </motion.div>
            ) : null}

            {/* When hasNetworkSelectionSubmitted is false, show the static Testnet Settings section */}
            {!hasNetworkSelectionSubmitted &&
            selectedNetwork === Networks.TESTNET ? (
                <>
                    <SubDivider
                        title="Testnet Settings"
                        layout={SubDividerLayout.DEFAULT}
                    />
                    <div className="p-4">
                        <Label>Testnet Peer Address</Label>
                        <div className="flex-col space-y-4 mt-2">
                            <input
                                id="input"
                                type="text"
                                className="block w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter testnet peer address"
                                value={testnetPeerAddress || ""}
                                onChange={(e) =>
                                    setTestnetPeerAddress(e.target.value)
                                }
                            />
                            <Button
                                disabled={!isSaveTestnetPeerAddressEnabled} // Disable based on validation
                                onClick={async () => {
                                    if (
                                        store &&
                                        isSaveTestnetPeerAddressEnabled
                                    ) {
                                        await store.set(
                                            "testnet-peer-address",
                                            { value: testnetPeerAddress }
                                        );
                                        await store.save();
                                        toast("Testnet Peer Address Updated", {
                                            description:
                                                "Your testnet peer address has been updated.",
                                        });
                                    }
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
