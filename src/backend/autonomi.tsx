import { invoke } from "@tauri-apps/api/core";

// =======
// This file contains low-level backend code, mostly interacting with Rust layer by commands.
// Just basic types allowed and types, that correspond to Rust types.
// =======


const REGISTER_META_PREFIX = "jams";

async function listAccounts(): Promise<Array | null> {
    try {
        return await invoke<Array>("list_accounts");
    } catch (e) {
        console.error("listAccounts: ", e);
        return null;
    }
}

async function connectInner(login: string, password: string, newAccount: boolean) {
    console.log("connecting...");
    await invoke("connect", {
        //      peer: "/ip4/127.0.0.1/udp/33383/quic-v1/p2p/12D3KooW9stXvTrU7FRWXoBSvHaoLaJmdBMYRdtd8DsYbK2jZJen" // local
        peer: "OFFICIAL NETWORK",
        login: login,
        password: password,
        register: newAccount,
    });
    console.log(await balance());
    console.log("connected.");
}

// Finds user folder in storage by login,
// decrypts SecretKey with the password
// and connects to the network.
export async function loginAndConnect(login: string, password: string) {
    console.log("logging in...");
    try {
        await connectInner(login, password, false);
        console.log("logged in.");
    } catch (e) {
        console.error("login: ", e);
    }
}

// Creates user folder in storage,
// encrypts SecretKey with the password and stores in the folder
// and connects to the network.
export async function registerAndConnect(login: string, password: string) {
    console.log("registering...");
    try {
        await connectInner(login, password, true);
        console.log("registered.");
    } catch (e) {
        console.error("register: ", e);
    }
}


export async function disconnect() {
    console.log("disconnecting...");
    try {
        await invoke("disconnect");
        console.log("disconnected.");
    } catch (e) {
        console.error("disconnect: ", e);
    }
}

export async function clientAddress(): Promise<string | null> {
    try {
        return await invoke<string>("client_address");
    } catch (e) {
        console.error("clientAddress: ", e);
        return null;
    }
}

export async function balance(): Promise<string | null> {
    try {
        return await invoke("balance");
    } catch (e) {
        console.error("balance: ", e);
        return null;
    }
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
        return null;
    }
}

// TODO: deprecated, there is no faucet in current network.
export async function receive(transfer: string) {
    try {
        await invoke("receive", { transfer: transfer });
        console.log("received.");
    } catch (e) {
        console.error("receive: ", e);
    }
}

export async function readRegister(name: string[]): Promise<object | null> {
    prepareMeta(name);
    console.log("reading register: " + name + "...");

    try {
        return JSON.parse(await invoke("read_register", { name: name }));
    } catch (e) {
        console.error("readRegister: ", e);
        return null;
    }
}

export async function writeRegister(name: string[], data: object) {
    prepareMeta(name);
    console.log("writing register: " + name + "...");

    try {
        await invoke("write_register", {
            name: name,
            data: JSON.stringify(data),
        });
    } catch (e) {
        console.error("writeRegister: ", e);
    }
}
