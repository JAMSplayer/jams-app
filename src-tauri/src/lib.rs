use futures::lock::Mutex;
use safe::{registers::XorNameBuilder, Multiaddr, Safe, SecretKey};
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Emitter, Manager, State};

mod secure_sk;
mod server;

const ACCOUNTS_DIR: &str = "accounts";
const SK_FILENAME: &str = "sk.key";
const ADDRESS_FILENAME: &str = "evm_address";

#[derive(Debug, Serialize, Deserialize)]
enum Error {
    Common(String),
    BadLogin,
    BadPassword,
    NotConnected,
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            crate::Error::Common(msg) => f.write_str(&msg),
            _ => write!(f, "{:?}", self),
        }
    }
}

impl std::error::Error for Error {}

impl From<tauri::Error> for Error {
    fn from(tauri_error: tauri::Error) -> Self {
        Self::Common(format!("Tauri: {}", tauri_error))
    }
}

impl From<safe::Error> for Error {
    fn from(safe_error: safe::Error) -> Self {
        Self::Common(format!("Safe: {}", safe_error))
    }
}

fn make_root(app: &mut AppHandle) -> Result<PathBuf, Error> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|_| Error::Common(format!("Could not get app data dir")))?;
    fs::create_dir_all(&app_data).map_err(|_| {
        Error::Common(format!(
            "Could not create app data dir: {}",
            &app_data.display()
        ))
    })?;

    Ok(app_data)
}

fn user_root(app_root: &PathBuf, login: String) -> PathBuf {
    let mut sk_dir = app_root.clone();
    sk_dir.push(ACCOUNTS_DIR);
    sk_dir.push(login);

    sk_dir
}

fn load_create_key(
    app_root: &PathBuf,
    login: String,
    password: String,
    register: bool,
) -> Result<SecretKey, Error> {
    let sk_dir = user_root(app_root, login);
    let mut sk_file = sk_dir.clone();
    sk_file.push(SK_FILENAME);

    let not_readable_msg = format!("Could not read user key file: {}", &sk_file.display());
    let sk = if sk_file
        .try_exists()
        .map_err(|_| Error::Common(not_readable_msg.clone()))?
    {
        if register {
            return Err(Error::Common(String::from("User already exists")));
        }

        let bytes = fs::read(&sk_file).map_err(|_| Error::Common(not_readable_msg.clone()))?;

        secure_sk::decrypt(&bytes, &password)?
    } else {
        if !register {
            return Err(Error::BadLogin);
        }

        let sk = SecretKey::random();

        let file_bytes = secure_sk::encrypt(sk.clone(), &password)?;
        fs::create_dir_all(sk_dir.clone()).map_err(|_| {
            Error::Common(format!("Could not create user dir: {}", &sk_dir.display()))
        })?;
        fs::write(&sk_file, file_bytes).map_err(|_| {
            Error::Common(format!(
                "Could not save user key file: {}",
                &sk_file.display()
            ))
        })?;
        sk
    };

    Ok(sk)
}

#[tauri::command]
async fn list_accounts(mut app: AppHandle) -> Result<Vec<(String, String)>, Error> {
    let mut accounts_dir = make_root(&mut app)
        .map_err(|_| Error::Common(format!("Cannot access/create application folder.")))?;
    accounts_dir.push(ACCOUNTS_DIR);

    let default_mod_time = std::time::SystemTime::now();

    let mut entries = fs::read_dir(accounts_dir)
        .map_err(|err| Error::Common(format!("Error reading accounts. {}", err)))?
        .filter(Result::is_ok)
        .map(Result::unwrap)
        .filter(|entry| entry.file_type().unwrap().is_dir())
        .map(|entry| {
            let address_file = entry.path().join(ADDRESS_FILENAME);

            let modified = address_file
                .metadata()
                .map(|m| m.modified().unwrap_or(default_mod_time))
                .unwrap_or(default_mod_time);
            let username = entry.file_name().to_string_lossy().to_string();
            let address = fs::read_to_string(&address_file)
                .inspect_err(|err| eprintln!("Error reading address file. {}", err))
                .unwrap_or(String::from("<error>"));

            (modified, username, address)
        })
        .collect::<Vec<(std::time::SystemTime, String, String)>>();

    entries.sort(); // sort by "modified"

    Ok(entries
        .iter()
        .map(|(_modified, username, address)| (username.clone(), address.clone()))
        .collect::<Vec<(String, String)>>())
}

// leave peer empty or anything other than Multiaddr to connect to official network.
#[tauri::command]
async fn connect(peer: Option<String>, app: AppHandle) -> Result<(), Error> {
    let state = app.try_state::<Mutex<Option<Safe>>>();
    if state.is_some() {
        return if state.unwrap().lock().await.is_some() {
            println!("Already connected.");
            Ok(())
        } else {
            println!("Already connecting...");
            Err(Error::Common(String::from("Already connecting.")))
        };
    }
    app.manage(Mutex::new(None::<Safe>));

    let mut peers: Vec<Multiaddr> = Vec::new();

    let add_network_contacts = peer.map(|p_str| p_str.parse::<Multiaddr>().inspect(|multi_addr| {
        println!("Peer: {}", &multi_addr);
        peers.push(multi_addr.clone());
    }).map(|_| false).unwrap_or(true)).unwrap_or(true);

    if add_network_contacts {
        println!("Connecting to official network.");
    }

    //    Safe::init_logging().map_err(|_| Error::Common(format!("Autonomi logging error")))?;
    Safe::init_logging().unwrap();

    println!("\n\nConnecting...");

    let safe = Safe::connect(peers, add_network_contacts, None)
        .await
        .inspect_err(|_| {
            app.unmanage::<Mutex<Option<Safe>>>();
        })?;

    println!("\n\nConnected.");

    // Emit the connect event with the extracted address
    let _ = app.emit("connect", ())
        .inspect_err(|e| eprintln!("{}", e));

    // Store the `safe` object in the application's state
    *(app.state::<Mutex<Option<Safe>>>().lock().await) = Some(safe);

    Ok(())
}

#[tauri::command]
async fn sign_in(
    login: String,
    password: String,
    register: bool,
    mut app: AppHandle,
) -> Result<(), Error> {
    let app_root = make_root(&mut app)?;
    let sk = load_create_key(&app_root, login.clone(), password, register)?;
    println!("\n\nSecret Key: {}", sk.to_hex());

    let signed_in_safe = app
        .try_state::<Mutex<Option<Safe>>>()
        .ok_or(Error::NotConnected)?
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .login(Some(sk))?;

    let address = signed_in_safe.address()?.to_string();
    println!("ETH wallet address: {}", address);

    // Store new `safe` object in the application's state
    *(app.state::<Mutex<Option<Safe>>>().lock().await) = Some(signed_in_safe);

    // Prepare the address directory and file
    let addr_dir = user_root(&app_root, login.clone());
    let mut addr_file = addr_dir.clone();
    addr_file.push(ADDRESS_FILENAME);

    // Write the address to a file
    fs::write(&addr_file, &address).map_err(|_| {
        Error::Common(format!(
            "Could not save address file: {}",
            &addr_file.display()
        ))
    })?;

    let _ = app.emit("sign_in", ())
        .inspect_err(|e| eprintln!("{}", e));

    Ok(())
}

#[tauri::command]
async fn is_connected(app: AppHandle) -> bool {
    let safe = app.try_state::<Mutex<Option<Safe>>>();
    safe.is_some() // state is managed
        && safe.unwrap().lock().await.as_ref().is_some() // option<safe> is some
}

#[tauri::command]
async fn disconnect(app: AppHandle) -> Result<(), Error> {
    app.unmanage::<Mutex<Option<Safe>>>()
        .ok_or(Error::NotConnected)?;

    let _ = app.emit("disconnect", ())
        .inspect_err(|e| eprintln!("{}", e));

    Ok(())
}

fn meta_builder(name: Vec<String>) -> Result<XorNameBuilder, Error> {
    if name.is_empty() {
        return Err(Error::Common(String::from("Empty register name.")));
    }
    let mut mb = XorNameBuilder::from_str(&name[0]);
    for n in &name[1..] {
        mb = mb.with_str(&n);
    }
    Ok(mb)
}

#[tauri::command]
async fn create_register(
    name: Vec<String>,
    data: String,
    safe: State<'_, Mutex<Option<Safe>>>,
) -> Result<String, Error> {
    println!("\n\nRegister create...");
    println!("Name: {:?}", name);

    let meta = meta_builder(name)
        .unwrap_or(XorNameBuilder::random())
        .build();
    println!("Data: {}", &data);
    println!("Meta: {}", &meta);

    //    let (mut reg, cost, royalties) = safe
    let reg = safe
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .register_create(&data.as_bytes(), meta, None)
        .await?;

    println!("\n\nRegister created: {:?}", reg);
    //    println!("Costs: {}, {}", cost, royalties);

    //    Ok((reg.address().to_hex(), cost.as_nano(), royalties.as_nano()))
    Ok(reg.address().to_hex())
}

#[tauri::command]
async fn read_register(
    name: Vec<String>,
    safe: State<'_, Mutex<Option<Safe>>>,
) -> Result<String, Error> {
    let meta = meta_builder(name)?.build();

    let mut reg = safe
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .open_own_register(meta)
        .await?;

    let data = Safe::read_register(&mut reg, 0)
        .await?
        .unwrap_or(Vec::new());

    Ok(String::from_utf8(data).map_err(|e| Error::Common(format!("{e}")))?)
}

#[tauri::command]
async fn write_register(
    name: Vec<String>,
    data: String,
    safe: State<'_, Mutex<Option<Safe>>>,
) -> Result<(), Error> {
    println!("\n\nRegister write...");
    println!("Name: {:?}", name);

    let meta = meta_builder(name)?.build();
    println!("Meta: {}", meta);

    let mut reg = safe
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .open_own_register(meta)
        .await?;

    println!("\n\nRegister found: {:?}", reg);

    println!("Writing data: {}", &data);
    if !data.is_empty() {
        let reg = safe
            .lock()
            .await
            .as_mut()
            .ok_or(Error::NotConnected)?
            .register_write(&mut reg, data.as_bytes())
            .await?;

        println!("\n\nRegister updated: {:?}", reg);
    } else {
        return Err(Error::Common(String::from("Empty data object string.")));
    }

    Ok(())
}

#[tauri::command]
async fn client_address(safe: State<'_, Mutex<Option<Safe>>>) -> Result<String, Error> {
    let address = safe
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .address()?;
    Ok(address.to_string())
}

#[tauri::command]
async fn balance(safe: State<'_, Mutex<Option<Safe>>>) -> Result<String, Error> {
    let balance = safe
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .balance()
        .await?;
    Ok(format!("{:x}", balance)) // hex string
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            list_accounts,
            connect,
            sign_in,
            is_connected,
            disconnect,
            create_register,
            read_register,
            write_register,
            client_address,
            balance,
        ])
        .setup(|app| {
            server::run(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
