import {
    connectInner,
    register,
    clientAddress,
    createReg,
    isConnected,
    readReg,
    writeReg,
    listAccounts,
} from "@/backend/autonomi";
import {
    AccountUser,
    RegisterAccountUser,
    SimpleAccountUser,
} from "@/types/account-user";
import {
    getSelectedNetwork,
    getTestnetPeerAddress,
} from "@/backend/backend-store";
import Networks from "@/enums/networks";
import { isEthereumAddress } from "@/lib/utils/address";

// =======
// This file contains higher-level backend code with some application logic, and can use frontend types.
// =======

export async function connect(override?: {
    network: Networks;
    peer?: string;
}): Promise<boolean> {
    console.log("connecting...");
    try {
        let peer = undefined;
        let network = undefined;

        // this is used if connecting from the disconnected-panel component
        if (override && override.network) {
            network = override.network;
            if (network == Networks.TESTNET) {
                peer = override.peer;
            }
        } else {
            network = await getSelectedNetwork();
            if (network == Networks.TESTNET) {
                peer = await getTestnetPeerAddress();
            }
        }

        if (network == Networks.TESTNET && !peer) {
            console.error("Peer not supplied for TESTNET.");
            return false;
        }

        const success = await connectInner(peer ?? undefined);
        if (success) {
            console.log("connected.");
            return true;
        }
    } catch (e) {
        console.error("connect: ", e);
    }
    return false;
}

export async function registerUser(
    newUser: RegisterAccountUser
): Promise<AccountUser | null> {
    console.log(`Attempting to create a new user: ${newUser.username}`);

    try {
        // Register and connect the user
        const success = await register(newUser.username, newUser.password);
        if (!success) {
            return null;
        }

        // Retrieve the client address
        const address = await clientAddress();

        // Check if address is null and handle it if needed
        if (address === null) {
            console.error(
                `Failed to retrieve address for user: ${newUser.username}`
            );
            return null;
        }

        // check if address is not a valid address
        if (!isEthereumAddress(address)) {
            console.error(
                `Failed to retrieve a valid address for user: ${newUser.username}`
            );
            return null;
        }

        const registeredUser = { ...newUser, address };
        registeredUser.password = ""; // we cannot save passwords

        // Create a new Reg for the user
        const regCreated = await createReg(["user"], registeredUser);
        if (!regCreated) {
            console.error(
                `Failed to create a new user Reg for: ${newUser.username}`
            );
            return null;
        }

        console.log(`User ${newUser.username} created successfully.`);
        return registeredUser;
    } catch (error) {
        console.error(
            `Error during user registration for ${newUser.username}:`,
            error
        );
        return null;
    }
}

export async function saveUser(user: AccountUser) {
    console.log("saving user: ", user);
    await writeReg(["user"], user);
}

// Returns user account object if account is connected, null if not.
export async function getConnectedUserAccount(): Promise<AccountUser | null> {
    try {
        let connected = await isConnected();

        if (connected) {
            console.log("getting user...");

            const user = await readReg(["user"]);
            if (user) {
                console.log("user: ", user);
                return user as AccountUser;
            }

            console.log("User not found.");
        }
    } catch (e) {
        console.error("Unexpected error in getConnectedUserAccount: ", e);
    }

    return null;
}

// Return all registered accounts with addresses, sorted from most recently used.
export async function registeredAccounts(): Promise<SimpleAccountUser[]> {
    // Fetch the accounts as an array of [username, address] tuples
    const accounts = await listAccounts();

    // If the accounts are not null, map the tuples to SimpleAccountUser objects
    // Assuming accounts is an array of tuples [username, address]
    if (accounts) {
        // Reverse the accounts array
        accounts.reverse();

        // Filter out invalid Ethereum addresses and then map the results
        return accounts
            .filter(([_username, address]) => isEthereumAddress(address)) // Filter valid addresses
            .map(([username, address]) => ({
                username,
                address,
            }));
    } else {
        return [];
    }
}
