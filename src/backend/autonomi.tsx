import { AccountUser } from "@/types/account-user";
import { invoke } from "@tauri-apps/api/core";

const REGISTER_META_PREFIX = "jams";

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

export async function connect() {
    console.log("connecting...");
    try {
        await invoke("connect", {
            //      peer: "/ip4/127.0.0.1/udp/33383/quic-v1/p2p/12D3KooW9stXvTrU7FRWXoBSvHaoLaJmdBMYRdtd8DsYbK2jZJen" // local
            peer: "OFFICIAL NETWORK",
            login: "test3",
            password: "test",
            register: false,
        });
	    console.log(await balance());
        console.log("connected.");
    } catch (e) {
        console.error("connect: ", e);
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

// TODO implement - should just check if connected to network
export async function checkIsConnected(): Promise<boolean> {
    try {
        await invoke("client_address");
        return true;
    } catch (e) {
        return false;
    }
}

// TODO implement - should check return user account object if account is connected, null if not.
// look at: providers/connection-provider.tsx
export async function checkIsAccountConnected(): Promise<AccountUser | null> {
    try {
        const account: AccountUser = {
            username: "",
            password: "",
            address: "",
            dateCreated: new Date(),
            dateUpdated: new Date(),
        };
        return account;
    } catch (e) {
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
