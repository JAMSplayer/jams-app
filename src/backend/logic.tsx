import {
    registerAndConnect,
    clientAddress,
    createRegister,
    readRegister,
    writeRegister,
    listAccounts,
} from "@/backend/autonomi";
import {
    AccountUser,
    RegisterAccountUser,
    SimpleAccountUser,
} from "@/types/account-user";

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
        registeredUser.password = ""; // we cannot save passwords

        // Create a new register for the user
        const registerAddress = await createRegister(["user"], registeredUser);
        if (!registerAddress) {
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
    console.log("Attempting to check if network is connected");
    try {
        let address = await clientAddress();
        console.log("network is connected");
        return address !== null;
    } catch (e) {
        console.log("network is not connected");
        return false;
    }
}

// Returns user account object if account is connected, null if not.
export async function getConnectedUserAccount(): Promise<AccountUser | null> {
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
        console.error("Unexpected error in getConnectedUserAccount: ", e);
    }

    return null;
}

// Return all registered accounts with addresses, sorted from most recently used.
export async function registeredAccounts(): Promise<SimpleAccountUser[]> {
    // Fetch the accounts as an array of [username, address] tuples
    const accounts = await listAccounts();

    // If the accounts are not null, map the tuples to SimpleAccountUser objects
    if (accounts) {
        return accounts.map(([username, address]) => ({
            username,
            address,
        }));
    } else {
        return [];
    }
}
