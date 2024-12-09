import { invoke } from "@tauri-apps/api/core";

// =======
// This file contains low-level backend code, mostly interacting with Rust layer by commands.
// Just basic types allowed and types, that correspond to Rust types.
// =======

const REGISTER_META_PREFIX = "jams";

export async function listAccounts(): Promise<[string, string][] | null> {
    try {
        return await invoke<[string, string][]>("list_accounts");
    } catch (e) {
        console.error("listAccounts: ", e);
    }
    return null;
}

// if peer is a Multiaddr, it will connect to local network.
// leave peer empty or anything other than Multiaddr to connect to official network.
export async function connectInner(peer?: string): Promise<boolean> {
    console.log("connecting...");
    try {
        if (peer) {
            await invoke("connect", { peer: peer });
        } else {
            await invoke("connect");
        }
        console.log("connected.");
        return true;
    } catch(e) {
        console.error("connectInner: ", e);
    }
    return false;
}

// Finds user folder in storage by login,
// and decrypts SecretKey with the password
export async function signIn(
    login: string,
    password: string
): Promise<boolean> {
    console.log("logging in...");
    try {
        await invoke("sign_in", {
            login: login,
            password: password,
            register: false,
        });
        console.log("logged in.");
        return true;
    } catch (e) {
        console.error("login: ", e);
    }
    return false;
}

// Creates user folder in storage
// and encrypts SecretKey with the password and stores in the folder
export async function register(
    login: string,
    password: string,
    secretKeyImport?: string // if you want to register an account with particular SK
): Promise<boolean> {
    console.log("registering...");
    try {
        await invoke("sign_in", {
            login: login,
            password: password,
            register: true,
            secret_key_import: secretKeyImport,
        });
        console.log("registered.");
        return true;
    } catch (e) {
        console.error("register: ", e);
    }
    return false;
}

// Checks if user is connected to the network.
// This implies, that user is also logged to the application: login
// and password were OK, and SecretKey has been decrypted from storage.
export async function isConnected(): Promise<boolean> {
    console.log("Attempting to check if network is connected");
    try {
        if (await invoke<boolean>("is_connected")) {
            console.log("network is connected");
            return true;
        } else {
            console.log("network is not connected");
        }
    } catch (e) {
        console.error("isConnected: ", e);
    }
    return false;
}

export async function disconnect(): Promise<boolean> {
    console.log("disconnecting...");
    try {
        await invoke("disconnect");
        console.log("disconnected.");
        return true;
    } catch (e) {
        console.error("disconnect: ", e);
    }
    return false;
}

export async function clientAddress(): Promise<string | null> {
    try {
        return await invoke<string>("client_address");
    } catch (e) {
        console.error("clientAddress: ", e);
    }
    return null;
}

export async function balance(): Promise<string | null> {
    try {
        return await invoke("balance");
    } catch (e) {
        console.error("balance: ", e);
    }
    return null;
}

export async function secretKey(
    login: string,              // which user SK to get
    password: string,           // user password to decrypt the key
): Promise<string | null> {     // if password is bad or other error occured, null will be returned
    try {
        return await invoke("check_key", {
            login: login,
            password: password,
        });
    } catch (e) {
        console.error("secretKey: ", e);
    }
    return null;
}

function prepareMeta(name: string[]): string[] {
    name.unshift(REGISTER_META_PREFIX);
    return name;
}

export async function createRegister(
    name: string[],
    data?: object
): Promise<string | null> {
    prepareMeta(name);
    console.log("creating register...");
    try {
        const ret = await invoke<[string, number, number]>("create_register", {
            name: name,
            data: typeof data === "undefined" ? "" : JSON.stringify(data),
        });

        console.log("created register.");
        console.log(ret);

        console.log(await balance());
        // const [address, cost, royalties] = ret;
        const [address] = ret;
        return address;
    } catch (e) {
        console.error("createRegister: ", e);
    }
    return null;
}

export async function readRegister(name: string[]): Promise<object | null> {
    prepareMeta(name);
    console.log("reading register: " + name + "...");

    try {
        return JSON.parse(await invoke("read_register", { name: name }));
    } catch (e) {
        console.error("readRegister: ", e);
    }
    return null;
}

export async function writeRegister(
    name: string[],
    data: object
): Promise<boolean> {
    prepareMeta(name);
    console.log("writing register: " + name + "...");

    try {
        await invoke("write_register", {
            name: name,
            data: JSON.stringify(data),
        });
        return true;
    } catch (e) {
        console.error("writeRegister: ", e);
    }
    return false;
}
