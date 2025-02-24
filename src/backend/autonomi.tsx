import { invoke } from "@tauri-apps/api/core";

// =======
// This file contains low-level backend code, mostly interacting with Rust layer by commands.
// Just basic types allowed and types, that correspond to Rust types.
// =======

const REG_META_PREFIX = "jams";

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
    } catch (e) {
        console.error("connectInner: ", e);
    }
    return false;
}

// Finds user folder in storage by username,
// and decrypts key with the password
export async function signIn(
    username: string,
    password: string
): Promise<boolean> {
    console.log("logging in...");
    try {
        await invoke("sign_in", {
            login: username,
            password: password,
            register: false,
        });
        console.log("logged in.");
        return true;
    } catch (e) {
        console.error("signIn: ", e);
    }
    return false;
}

// Creates user folder in storage
// and encrypts Private Key with the password and stores in the folder
export async function register(
    username: string,
    password: string,
    ethPkImport?: string // if you want to register an account with particular privkey
): Promise<boolean> {
    console.log("registering...");
    try {
        await invoke("sign_in", {
            login: username,
            password: password,
            register: true,
            ethPkImport: ethPkImport,
        });
        console.log("registered.");
        return true;
    } catch (e) {
        console.error("register: ", e);
    }
    return false;
}

// Checks if user is connected to the network. This does not mean,
// that the user is also signed in.
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

export async function privateKey(
    username: string,              // which user PK to get
    password: string,           // user password to decrypt the key
): Promise<string | null> {     // if password is bad or other error occured, null will be returned
    try {
        return await invoke("check_key", {
            login: username,
            password: password,
        });
    } catch (e) {
        console.error("privateKey: ", e);
    }
    return null;
}

export async function deleteAccount(username: string): Promise<boolean> {
    console.log("deleting account...");
    try {
        await invoke("delete_account", { login: username });
        console.log("account deleted.");
        return true;
    } catch (e) {
        console.error("deleteAccount: ", e);
    }
    return false;
}

export async function sessionRead(key: string): Promise<string | null> {
    return await invoke("session_read", { key: key });
}

export async function sessionSet(
    key: string,
    value: string | null, // null if we want to remove the record.
): Promise<string | null> { // returns previous value, or null if the value was not present
    return await invoke("session_set", { key: key, value : value });
}

function prepareMeta(name: string[]): string[] {
    name.unshift(REG_META_PREFIX);
    return name;
}

export async function createReg(
    name: string[],
    data?: object
): Promise<boolean> {
    prepareMeta(name);
    console.log("creating Reg: " + name + "...");
    try {
        await invoke("create_reg", {
            name: name,
            data: typeof data === "undefined" ? "" : JSON.stringify(data),
        });

        console.log("created Reg.");
        console.log(await balance());
        return true;
    } catch (e) {
        console.error("createReg: ", e);
    }
    return false;
}

export async function readReg(name: string[]): Promise<object | null> {
    prepareMeta(name);
    console.log("reading Reg: " + name + "...");

    try {
        return JSON.parse(await invoke("read_reg", { name: name }));
    } catch (e) {
        console.error("readReg: ", e);
    }
    return null;
}

export async function writeReg(
    name: string[],
    data: object
): Promise<boolean> {
    prepareMeta(name);
    console.log("writing Reg: " + name + "...");

    try {
        await invoke("write_reg", {
            name: name,
            data: JSON.stringify(data),
        });

        console.log("written Reg.");
        console.log(await balance());
        return true;
    } catch (e) {
        console.error("writeReg: ", e);
    }
    return false;
}

// returns xorname address
export async function uploadFile(
    path: string, // filesystem path
): Promise<string | null> {
    console.log("uploading file: " + path + "...");
    try {
        return await invoke("upload", { file: path });
    } catch (e) {
        console.error("uploadFile: ", e);
    }
    return null;
}

// returns xorname address
export async function putData(
    data: Uint8Array, // file data
): Promise<string | null> {
    console.log("saving data blob of " + data.length + " bytes...");
    try {
        return await invoke("put_data", { data: data });
    } catch (e) {
        console.error("putData: ", e);
    }
    return null;
}

export async function download(
    xorname: string,
    destinationDir: string,
): Promise<object> {
    return await invoke("download", {
        xorname: xorname,
        destination: destinationDir
    });
}
