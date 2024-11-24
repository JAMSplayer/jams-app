import {
    registerAndConnect,
    clientAddress,
    createRegister,
    readRegister,
    writeRegister,
} from "@/backend/autonomi";
import { AccountUser, RegisterAccountUser } from "@/types/account-user";

// =======
// This file contains higher-level backend code with some application logic, and can use frontend types.
// =======

export async function registerUser(
    newUser: RegisterAccountUser
): Promise<AccountUser | null> {
    console.log("creating new user: ", newUser);

    registerAndConnect(newUser.username, newUser.password);
    newUser.password = "";
    try {
        let address = await clientAddress();
        createdUser = { ...newUser, address: address };

        // Attempt to create a new register for the user
        const success = await createRegister(["user"], createdUser);
        if (success) {
            console.log("New user created successfully.");
            return createdUser;
        }

        console.error("Failed to create a new user.");
    } catch (e) {
        console.error("Unexpected error in registerUser: ", e);
    }
    
    return null;
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

