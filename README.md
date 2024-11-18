# JAMS App

![128x128](https://github.com/user-attachments/assets/b9816724-a71f-45c4-8213-5eb72b889d7a)

## Getting Started

### Backend

* System libraries and Rust: https://v2.tauri.app/start/prerequisites/

* Download Rust dependencies.

```bash
git clone git@github.com:JAMSplayer/safe.git
```

Edit `src-tauri/Cargo.toml` and provide path to *safe* lib in `[dependencies]` section. Please, do not commit this change back to the repo.

### Frontend

1. Node.js and npm/yarn

1. **Install Node modules**:  
   Run the following command in your terminal:

    ```bash
    yarn install

    ```

1. **Build Tauri App**:  
   Run the following command in your terminal:

    ```bash
    yarn run tauri build

    ```

1. **Run Tauri App**:  
   Run the following command in your terminal:
    ```bash
    yarn run tauri dev
    ```

Side-note: If you wish to run the development web server (if you for some reason don't want to run it via tauri):

```bash
yarn run dev

```

### Network

* Connecting to a network isn't required at the moment to run the app, but you can run a local testnet:

https://github.com/maidsafe/safe_network/blob/main/README.md#Using-a-local-network

* Connect to local testnet:

Edit `await invoke("connect", [...]` line in `connect()` function in `src/backend/autonomi.tsx` file, and replace `peer` value with one of your local nodes' Multiaddress, which can be found in node logs. You can see where logs are stored when starting local network, the startup process will output something like "Logging to directory: [...]". In the logfile you search for the line looking like this: `Local node is listening ListenerId(1) on "/ip4/127.0.0.1/udp/11111/quic-v1/p2p/AaaAaa11AaaAaa11AaaAaa11AaaAaa11AaaAaa11AaaAaa11AaaA"`. Address can also be checked running this command:

`cargo run --release --bin safenode-manager --features local -- local status --details`

* (alternatively) Connecting to official testnet:

Same as above, but instead local node's Multiaddr in `peer`, just insert something that is not Multiaddr, or leave it empty.
