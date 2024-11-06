import { OctagonXIcon, CheckIcon, InfoIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import isOnline from "is-online";

interface StatusItem {
    name: string;
    icon: React.ElementType; // or use a specific type if you know the icon component type
    description: string;
    bgColor: string;
}

export default function StatusRow() {
    const { address, balance } = { address: "someAddress", balance: 12.24 }; // TODO get from signed in user, if they are signed in
    const [onlineStatus, setOnlineStatus] = useState(false);
    const hasUserBalance = balance > 0;

    // have initial checks completed before showing the UI
    const [isInternetCheckedInitially, setIsInternetCheckedInitially] =
        useState(false);

    useEffect(() => {
        const checkInternetConnection = async () => {
            const online = await isOnline().finally(() => {
                setIsInternetCheckedInitially(true);
            });
            setOnlineStatus(online);
        };

        // Initial check for internet connectivity
        checkInternetConnection();

        // Set an interval to check the connection status periodically
        const intervalId = setInterval(checkInternetConnection, 10000); // Check every 10 seconds

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []);

    const statusList: StatusItem[] = [
        {
            name: "Token Balance",
            icon: hasUserBalance ? CheckIcon : OctagonXIcon,
            description: hasUserBalance
                ? "Your wallet address contains tokens"
                : "Your wallet address is empty",
            bgColor: hasUserBalance ? "bg-green-600" : "bg-red-600",
        },
        {
            name: "Internet Connection",
            icon: onlineStatus ? CheckIcon : OctagonXIcon,
            description: onlineStatus
                ? "You are connected to the internet"
                : "You are not connected to the internet",
            bgColor: onlineStatus ? "bg-green-600" : "bg-red-600",
        },
        {
            name: "Autonomi Node",
            icon: OctagonXIcon,
            description: "Your Autonomi node is not connected",
            bgColor: "bg-red-600",
        },
        {
            name: "Wallet Connected",
            icon: address ? CheckIcon : OctagonXIcon,
            description: address
                ? "Your wallet is connected"
                : "Your wallet is not connected",
            bgColor: address ? "bg-green-600" : "bg-red-600",
        },
    ];

    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogDescription, setDialogDescription] = useState("");

    function classNames(...classes: any[]) {
        return classes.filter(Boolean).join(" ");
    }

    return (
        isInternetCheckedInitially && (
            <div>
                <AlertDialog>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {dialogDescription}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction>Close</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>

                    <ul
                        role="list"
                        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 px-4"
                    >
                        {statusList.map((status) => (
                            <li
                                key={status.name}
                                className="col-span-1 flex rounded-md shadow-sm bg-background"
                            >
                                <div
                                    className={classNames(
                                        status.bgColor,
                                        "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium"
                                    )}
                                >
                                    <status.icon
                                        className="h-6 w-6 text-white"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t">
                                    <div className="flex-1 truncate px-4 py-2 text-sm">
                                        <div className="font-medium">
                                            {status.name}
                                        </div>
                                        <p className="text-wrap text-muted-foreground">
                                            {status.description}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 pr-2">
                                        <AlertDialogTrigger asChild>
                                            <button
                                                onClick={() => {
                                                    setDialogTitle(status.name);
                                                    setDialogDescription(
                                                        status.description
                                                    );
                                                }}
                                                type="button"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:text-muted-foreground text-primary focus:outline-none"
                                            >
                                                <span className="sr-only">
                                                    Open options
                                                </span>
                                                <InfoIcon
                                                    aria-hidden="true"
                                                    className="h-5 w-5"
                                                />
                                            </button>
                                        </AlertDialogTrigger>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </AlertDialog>
            </div>
        )
    );
}
