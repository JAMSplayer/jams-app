import {
    registerAndConnect,
    clientAddress,
    createRegister,
    readRegister,
    writeRegister,
    listAccounts,
} from "@/backend/autonomi";
import { AccountUser, RegisterAccountUser } from "@/types/account-user";
import { RecentAccount } from "@/types/recent-account";

// =======
// This file contains higher-level backend code with some application logic, and can use frontend types.
// =======

export async function registerUser(
    newUser: RegisterAccountUser
): Promise<AccountUser | null> {
    console.log(`Attempting to create a new user: ${newUser.username}`);

    try {
        // Register and connect the user
        await registerAndConnect(newUser.username, newUser.password);

        // Retrieve the client address
        const address = await clientAddress();

        // Check if address is null and handle it if needed
        if (address === null) {
            console.error(
                `Failed to retrieve address for user: ${newUser.username}`
            );
            return null;
        }

        const registeredUser = { ...newUser, address };

        // Create a new register for the user
        const success = await createRegister(["user"], registeredUser);
        if (!success) {
            console.error(
                `Failed to create a new user register for: ${newUser.username}`
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
    await writeRegister(["user"], user);
}

// Checks if user is connected to the network.
// This implies, that user is also logged to the application: login
// and password were OK, and SecretKey has been decrypted from storage.
export async function checkIsConnected(): Promise<boolean> {
    try {
        let address = await clientAddress();
        return address !== null;
    } catch (e) {
        return false;
    }
}

// Returns user account object if account is connected, null if not.
export async function checkIsAccountConnected(): Promise<AccountUser | null> {
    try {
        let connected = await checkIsConnected();

        if (connected) {
            console.log("getting user...");

            const user = await readRegister(["user"]);
            if (user) {
                console.log("user: ", user);
                return user as AccountUser;
            }

            console.error("User not found.");
        }
    } catch (e) {
        console.error("Unexpected error in checkIsAccountConnected: ", e);
    }

    return null;
}

// Return all registered accounts with addresses, sorted from most recently used.
export async function registeredAccounts(): Promise<RecentAccount[]> {
    // TODO
    const accounts = await listAccounts();
    if (accounts === null) {
        return [];
    }
    return accounts;
}
