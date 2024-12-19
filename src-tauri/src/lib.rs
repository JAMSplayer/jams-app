use futures::lock::Mutex;
use lofty::file::AudioFile;
use lofty::prelude::ItemKey;
use lofty::prelude::TaggedFileExt;
use lofty::read_from_path;
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

fn load_create_import_key(
    app_root: &PathBuf,
    login: String,
    password: String,
    eth_pk: Option<String>, // if you want to import ethereum private key during registration
    register: bool,
) -> Result<String, Error> {
    let sk_dir = user_root(app_root, login);
    let mut sk_file = sk_dir.clone();
    sk_file.push(SK_FILENAME);

    let not_readable_msg = format!("Could not read user key file: {}", &sk_file.display());
    let eth_pk = if sk_file
        .try_exists()
        .map_err(|_| Error::Common(not_readable_msg.clone()))?
    {
        if register {
            return Err(Error::Common(String::from("User already exists")));
        }

        let bytes = fs::read(&sk_file).map_err(|_| Error::Common(not_readable_msg.clone()))?;

        secure_sk::decrypt_eth(&bytes, &password)?
    } else {
        if !register {
            return Err(Error::BadLogin);
        }

        let pk = eth_pk.unwrap_or(SecretKey::random().to_hex()); // bls secret key can be used as eth privkey

        let file_bytes = secure_sk::encrypt_eth(pk.clone(), &password)?;
        fs::create_dir_all(sk_dir.clone()).map_err(|_| {
            Error::Common(format!("Could not create user dir: {}", &sk_dir.display()))
        })?;
        fs::write(&sk_file, file_bytes).map_err(|_| {
            Error::Common(format!(
                "Could not save user key file: {}",
                &sk_file.display()
            ))
        })?;
        pk
    };

    Ok(eth_pk)
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

    let add_network_contacts = peer
        .map(|p_str| {
            p_str
                .parse::<Multiaddr>()
                .inspect(|multi_addr| {
                    println!("Peer: {}", &multi_addr);
                    peers.push(multi_addr.clone());
                })
                .map(|_| false)
                .unwrap_or(true)
        })
        .unwrap_or(true);

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
    let _ = app
        .emit("connected", ())
        .inspect_err(|e| eprintln!("{}", e));


    // Store the `safe` object in the application's state
    *(app.state::<Mutex<Option<Safe>>>().lock().await) = Some(safe);

    Ok(())
}

#[tauri::command]
async fn sign_in(
    login: String,
    password: String,
    eth_pk_import: Option<String>,
    register: bool,
    mut app: AppHandle,
) -> Result<(), Error> {
    let app_root = make_root(&mut app)?;

    println!("eth_pk_import: {:?}", eth_pk_import);
    println!("register: {:?}", register);

    let pk = load_create_import_key(
        &app_root,
        login.clone(),
        password,
        eth_pk_import,
        register,
    )?;
    println!("\n\nEth Private Key: {}", pk);


    let secret_key_import = if let Some(ski) = secret_key_import {
        if !register {
            return Err(Error::Common(String::from(
                "Only can import secret key when registering",
            )));
        }
        Some(SecretKey::from_hex(&ski).map_err(|e| Error::Common(format!("Secret key: {}", e)))?)
    } else {
        None
    };

    let sk = load_create_import_key(
        &app_root,
        login.clone(),
        password,
        secret_key_import,
        register,
    )?;
    println!("\n\nSecret Key: {}", sk.to_hex());


    let signed_in_safe = app
        .try_state::<Mutex<Option<Safe>>>()
        .ok_or(Error::NotConnected)?
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)? // not signed in
        .login_with_eth(Some(pk))?; // sign in

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

    let _ = app.emit("sign_in", ()).inspect_err(|e| eprintln!("{}", e));

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

    let _ = app
        .emit("disconnected", ())
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
        .register_create(data.into_bytes(), meta, None)
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
            .register_write(&mut reg, data.into_bytes())
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

#[derive(Debug, serde::Serialize)]
struct FileMetadata {
    file_path: String,
    title: Option<String>,
    artist: Option<String>,
    album: Option<String>,
    genre: Option<String>,
    year: Option<u32>,
    track_number: Option<u32>,
    duration: Option<u64>,        // Duration in seconds
    channels: Option<u8>,         // Optional
    sample_rate: Option<u32>,     // Optional
    picture: Option<FilePicture>, // Use FilePicture struct for image and MIME type
}

fn truncate_to_max_length(value: String, max_length: usize) -> String {
    if value.len() > max_length {
        value.chars().take(max_length).collect() // Truncate string to the maximum length
    } else {
        value
    }
}

fn truncate_number(value: u32, max_length: usize) -> u32 {
    // Convert the number to a string and truncate it if it exceeds the max length
    let max_value = 10u32.pow(max_length as u32) - 1; // e.g., for max_length = 4, max_value = 9999
    if value > max_value {
        value % (max_value + 1) // Truncate the value to fit the length
    } else {
        value
    }
}

#[derive(Debug, serde::Serialize)]
struct FilePicture {
    data: Vec<u8>,             // Image data
    mime_type: Option<String>, // MIME type of the image (e.g., image/jpeg)
}

#[tauri::command]
async fn get_file_metadata(file_paths: Vec<String>) -> Result<Vec<FileMetadata>, String> {
    // TODO: change error type to Error
    const MAX_TITLE_LENGTH: usize = 100;
    const MAX_ARTIST_LENGTH: usize = 100;
    const MAX_ALBUM_LENGTH: usize = 100;
    const MAX_GENRE_LENGTH: usize = 30;
    const MAX_YEAR_LENGTH: usize = 4;
    const MAX_TRACK_NUMBER_LENGTH: usize = 3;

    let mut metadata_list = Vec::new();

    for file_path in file_paths {
        match read_from_path(&file_path) {
            Ok(tagged_file) => {
                let properties = tagged_file.properties();

                // Safely attempt to read each metadata field, skipping any that fail
                let title = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.get_string(&ItemKey::TrackTitle).map(String::from))
                    .map(|t| truncate_to_max_length(t, MAX_TITLE_LENGTH));

                let artist = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.get_string(&ItemKey::TrackArtist).map(String::from))
                    .map(|a| truncate_to_max_length(a, MAX_ARTIST_LENGTH));

                let album = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.get_string(&ItemKey::AlbumTitle).map(String::from))
                    .map(|a| truncate_to_max_length(a, MAX_ALBUM_LENGTH));

                let genre = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.get_string(&ItemKey::Genre).map(String::from))
                    .map(|g| truncate_to_max_length(g, MAX_GENRE_LENGTH));

                let year = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.get_string(&ItemKey::Year))
                    .and_then(|s| s.parse::<u32>().ok())
                    .map(|value| truncate_number(value, MAX_YEAR_LENGTH)); // Truncate if needed

                let track_number = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.get_string(&ItemKey::TrackNumber))
                    .and_then(|s| s.parse::<u32>().ok())
                    .map(|value| truncate_number(value, MAX_TRACK_NUMBER_LENGTH)); // Truncate if needed

                let duration = Some(properties.duration().as_secs());
                let channels = properties.channels();
                let sample_rate = properties.sample_rate();

                let picture = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.pictures().first()) // Get the first picture
                    .map(|pic| {
                        (
                            pic.data().to_vec(),                          // Access the picture data
                            pic.mime_type().map(|mime| mime.to_string()), // Map the MIME type to an Option<String>
                        )
                    });

                // Add file metadata to the list
                metadata_list.push(FileMetadata {
                    file_path,
                    title,
                    artist,
                    album,
                    genre,
                    year,
                    track_number,
                    duration,
                    channels,
                    sample_rate,
                    picture: picture.map(|(data, mime_type)| FilePicture { data, mime_type }),
                });
            }
            Err(err) => {
                // Log the error and skip the problematic file
                eprintln!("Failed to read metadata for {}: {}", file_path, err);
            }
        }
    }

    Ok(metadata_list)
}

#[tauri::command]
async fn upload(
    file: String, // file path
    app: AppHandle,
) -> Result<String, Error> { // hex-encoded xorname
    let path = PathBuf::from(file);
    let data = fs::read(&path)
        .map_err(|e| Error::Common(format!("File {} is not readable: {}", path.display(), e)))?;
    put_data(data, app).await
}

#[tauri::command]
async fn put_data(
    data: Vec<u8>,
    app: AppHandle
) -> Result<String, Error> { // hex-encoded xorname
    let data_address = app
        .try_state::<Mutex<Option<Safe>>>()
        .ok_or(Error::NotConnected)?
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)? // safe
        .upload(data)
        .await?;

    Ok(hex::encode(data_address))
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
            get_file_metadata,
            upload,
            put_data,
        ])
        .setup(|app| {
            server::run(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
