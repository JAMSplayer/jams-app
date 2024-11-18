import {
    createRegister,
    readRegister,
    writeRegister,
} from "@/backend/autonomi";
import { AccountUser, RegisterAccountUser } from "@/types/account-user";

export async function loadUser(): Promise<AccountUser | null> {
    console.log("getting user...");

    try {
        const user = await readRegister(["user"]);
        if (user) {
            console.log("user: ", user);
            return user as AccountUser;
        }

        console.error("User not found.");
        return null;
    } catch (e) {
        console.error("Unexpected error in loadUser: ", e);
        return null;
    }
}

export async function registerUser(
    newUser: RegisterAccountUser
): Promise<AccountUser | null> {
    console.log("creating new user: ", newUser);

    try {
        // Attempt to create a new register for the user
        const success = await createRegister(["user"], newUser);
        if (success) {
            console.log("New user created successfully.");
            return { ...newUser, address: "" }; // TODO get the address from the new user
        }

        console.error("Failed to create a new user.");
        return null;
    } catch (e) {
        console.error("Unexpected error in registerUser: ", e);
        return null;
    }
}

export async function saveUser(user: AccountUser) {
    console.log("saving user: ", user);
    await writeRegister(["user"], user);
}
