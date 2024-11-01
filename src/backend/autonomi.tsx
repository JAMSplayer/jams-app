import { invoke } from "@tauri-apps/api/core";

const REGISTER_META_PREFIX = 'jams';

export async function clientAddress(): string {
  try {
    return await invoke('client_address');
  } catch (e) {
    console.error("clientAddress: ", e);
  }
}

export async function balance(): string {
  try {
    return await invoke('balance');
  } catch (e) {
    console.error("balance: ", e);
  }
}

export async function connect() {
  console.log("connecting...");
  try {
    await invoke("connect");
  } catch (e) {
    console.error("connect: ", e);
  }
  console.log("connected.");

  console.log(await balance());
}

function prepareMeta(name: string[]): string[] {
  return name.unshift(REGISTER_META_PREFIX);
}

export async function createRegister(name: string[], data?: object): string {
  prepareMeta(name);
  console.log("creating register...");
  try {
    var ret = await invoke("create_register", {
      name: name,
      data: typeof data === 'undefined' ? '' : JSON.stringify(data)
    });
    console.log("created register.");
    console.log(ret);
  
    console.log(await balance());
    var [address, cost, royalties] = ret;
    return address;
  } catch (e) {
    console.error("createRegister: ", e);
  }
}

export async function receive(transfer: string) {
  try {
    await invoke('receive', {transfer: transfer});
    console.log("received.");
  } catch (e) {
    console.error("receive: ", e);
  }
}

export async function readRegister(name: string[]): object {
  prepareMeta(name);
  console.log("reading register: " + name + "...");

  try {
    return JSON.parse(await invoke("read_register", { name: name }));
  } catch (e) {
    console.error("readRegister: ", e);
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
