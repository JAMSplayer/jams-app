import { receive, clientAddress, balance } from "@/backend/autonomi";

import { fetch } from "@tauri-apps/plugin-http";

export async function fundsFromFaucet() {
    const addressHex = await clientAddress();
    console.log(addressHex);
    const url = "http://127.0.0.1:8000/" + addressHex;
    console.log(url);

    try {
        const response = await fetch(url);
        console.log(response);

        // Use response.blob() to handle binary data
        const transfer = await (await response.blob()).text();
        console.log(transfer);

        console.log(await balance());

        const ret = await receive(transfer).catch((e) => {
            console.log(e);
        });
        console.log("received: ", ret);

        console.log(await balance());
    } catch (e) {
        console.error("Error fetching funds from faucet: ", e);
    }
}
