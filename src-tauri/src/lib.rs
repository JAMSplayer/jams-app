use futures::lock::Mutex;
use lofty::config::{ParseOptions, WriteOptions};
use lofty::file::{AudioFile, FileType, TaggedFile};
use lofty::picture::{MimeType, Picture, PictureType};
use lofty::prelude::{ItemKey, TaggedFileExt};
use lofty::read_from_path;
use lofty::tag::{Accessor, Tag, TagExt};
use safe::{registers::XorNameBuilder, Multiaddr, Safe, SecretKey, XorName};
use serde::{Deserialize, Serialize};
use std::{fs, io::Cursor, path::PathBuf};
use tauri::{AppHandle, Emitter, Manager, State};

mod frontend;
mod secure_sk;

#[cfg(target_os = "linux")]
mod server;

use frontend::*;

const ACCOUNTS_DIR: &str = "accounts";
const SK_FILENAME: &str = "sk.key";
const ADDRESS_FILENAME: &str = "evm_address";

const DEFAULT_LOG_LEVEL: &str = "INFO";

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

impl From<String> for Error {
    fn from(err: String) -> Self {
        Self::Common(err)
    }
}

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

    println!("\n\nConnecting...");

    let safe = Safe::connect(peers, add_network_contacts, None, DEFAULT_LOG_LEVEL.into())
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

    let pk = load_create_import_key(&app_root, login.clone(), password, eth_pk_import, register)?;
    println!("\n\nEth Private Key: {}", pk);

    app.try_state::<Mutex<Option<Safe>>>()
        .ok_or(Error::NotConnected)?
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)? // not signed in
        .login_with_eth(Some(pk))?; // sign in

    let address = client_address(
        app.try_state::<Mutex<Option<Safe>>>()
            .ok_or(Error::NotConnected)?,
    )
    .await?;
    println!("ETH wallet address: {}", address);

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

    session_set(
        String::from(USER_SESSION_KEY),
        Some(
            serde_json::to_string(&SimpleAccountUser {
                username: login,
                address: address,
            })
            .expect("Object values should be able to serialize."),
        ),
        app.clone(),
    )
    .await;

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

#[tauri::command]
async fn log_level(level: String, app: AppHandle) -> Result<(), Error> {
    let _ = app
        .try_state::<Mutex<Option<Safe>>>()
        .ok_or(Error::NotConnected)?
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)? // safe
        .log_level(level)?;

    Ok(())
}

type Session = std::collections::HashMap<String, String>;

#[tauri::command]
async fn session_set(key: String, value: Option<String>, app: AppHandle) -> Option<String> {
    let state = app
        .try_state::<Mutex<Session>>()
        .expect("Session not managed.");
    let mut session = state.lock().await;

    if let Some(v) = value {
        session.insert(key, v)
    } else {
        session.remove(&key)
    }
}

#[tauri::command]
async fn session_read(key: String, app: AppHandle) -> Option<String> {
    let state = app
        .try_state::<Mutex<Session>>()
        .expect("Session not managed.");
    let session = state.lock().await;

    session.get(&key).cloned()
}

fn meta_builder(name: Vec<String>) -> Result<XorNameBuilder, Error> {
    if name.is_empty() {
        return Err(Error::Common(String::from("Empty name.")));
    }
    let mut mb = XorNameBuilder::from_str(&name[0]);
    for n in &name[1..] {
        mb = mb.with_str(&n);
    }
    Ok(mb)
}

#[tauri::command]
async fn create_reg(
    name: Vec<String>,
    data: String,
    safe: State<'_, Mutex<Option<Safe>>>,
) -> Result<(), Error> {
    println!("\n\nReg create...");
    println!("Name: {:?}", name);

    let meta = meta_builder(name)
        .unwrap_or(XorNameBuilder::random())
        .build();
    println!("Data: {}", &data);
    println!("Meta: {}", &meta);

    //    let (mut reg, cost, royalties) = safe
    safe.lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .reg_create(data.as_bytes(), &meta)
        .await?;

    println!("\n\nReg created");
    //    println!("Costs: {}, {}", cost, royalties);

    //    Ok((reg.address().to_hex(), cost.as_nano(), royalties.as_nano()))
    Ok(())
}

#[tauri::command]
async fn read_reg(
    name: Vec<String>,
    safe: State<'_, Mutex<Option<Safe>>>,
) -> Result<String, Error> {
    let meta = meta_builder(name)?.build();

    let data = safe
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .read_reg(&meta, None)
        .await?;

    Ok(String::from_utf8(data).map_err(|e| Error::Common(format!("{e}")))?)
}

#[tauri::command]
async fn write_reg(
    name: Vec<String>,
    data: String,
    safe: State<'_, Mutex<Option<Safe>>>,
) -> Result<(), Error> {
    println!("\n\nReg write...");
    println!("Name: {:?}", name);

    let meta = meta_builder(name)?.build();
    println!("Meta: {}", meta);

    println!("Writing data: {}", &data);
    if !data.is_empty() {
        safe.lock()
            .await
            .as_mut()
            .ok_or(Error::NotConnected)?
            .reg_write(data.as_bytes(), &meta)
            .await?;

        println!("\n\nReg updated.");
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
    //    Ok(format!("{:x}", balance)) // hex string
    Ok(format!("{}", balance.0))
}

#[tauri::command]
async fn gas_balance(safe: State<'_, Mutex<Option<Safe>>>) -> Result<String, Error> {
    let balance = safe
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .balance()
        .await?;
    //    Ok(format!("{:x}", balance)) // hex string
    Ok(format!("{}", balance.1))
}

#[tauri::command]
fn check_key(login: String, password: String, mut app: AppHandle) -> Result<String, Error> {
    let app_root = make_root(&mut app)?;
    load_create_import_key(&app_root, login, password, None, false)
}

#[tauri::command]
fn delete_account(login: String, mut app: AppHandle) -> Result<(), Error> {
    let app_root = make_root(&mut app)?;
    let sk_dir = user_root(&app_root, login);
    if sk_dir.try_exists().map_err(|_| {
        Error::Common(format!(
            "Could not check existence of {}.",
            sk_dir.display()
        ))
    })? {
        fs::remove_dir_all(&sk_dir)
            .map_err(|e| Error::Common(format!("Could not remove {}: {}", sk_dir.display(), e)))?
    }
    Ok(())
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

impl FileMetadata {
    fn from_tagged_file(tagged_file: &TaggedFile) -> Self {
        const MAX_TITLE_LENGTH: usize = 100;
        const MAX_ARTIST_LENGTH: usize = 100;
        const MAX_ALBUM_LENGTH: usize = 100;
        const MAX_GENRE_LENGTH: usize = 30;
        const MAX_YEAR_LENGTH: usize = 4;
        const MAX_TRACK_NUMBER_LENGTH: usize = 3;

        // TODO: try to parse file_path in case of missing tags
        // (especially track_number, artist and title), because if reading only
        // beginning of a file, some tags can be cut because of big album art

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
            .and_then(|tag| {
                tag.get_string(&ItemKey::RecordingDate)
                    .or(tag.get_string(&ItemKey::Year))
            })
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

        FileMetadata {
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
            ..Default::default() // other fields will be None (serialized to null)
        }
    }
}

#[tauri::command]
async fn get_file_metadata(file_paths: Vec<String>) -> Result<Vec<FileMetadata>, Error> {
    let metadata_list: Vec<FileMetadata> = file_paths
        .into_iter()
        .map(|file_path| {
            match read_from_path(&file_path) {
                Ok(tagged_file) => {
                    let size = std::fs::File::open(&file_path)
                        .unwrap()
                        .metadata()
                        .unwrap()
                        .len();
                    let mut meta = FileMetadata::from_tagged_file(&tagged_file);
                    meta.size = Some(size as u32);
                    meta
                }
                Err(_) => {
                    FileMetadata {
                        ..Default::default() // other fields will be None (serialized to null)
                    }
                }
            }
        })
        .collect();

    Ok(metadata_list)
}

fn normalize_cover_art(input: FilePicture) -> Result<FilePicture, image::error::ImageError> {
    let img = image::ImageReader::new(Cursor::new(input.data.clone()))
        .with_guessed_format()?
        .decode()?;

    if img.width() > 200 || img.height() > 200 {
        let img = if img.width() > 200 && img.height() > 200 {
            img.resize_to_fill(200, 200, image::imageops::FilterType::CatmullRom)
        } else {
            img.resize(200, 200, image::imageops::FilterType::CatmullRom)
        };
    } else if input.data.len() < 40_000 {
        return Ok(input);
    }

    let mut output: Vec<u8> = vec![];
    let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut output, 70);
    encoder.encode_image(&img)?;
    Ok(FilePicture {
        data: output,
        mime_type: Some(String::from("image/jpeg")),
    })
}

#[tauri::command]
async fn save_file_metadata(song_file: FileMetadata, app: AppHandle) -> Result<(), Error> {
    let full_path = String::from(song_file.full_path()?.to_string_lossy().as_ref());

    let mut tagged_file = read_from_path(&full_path)
        .map_err(|e| Error::Common(format!("Cannot read tags from file {}", full_path)))?;
    tagged_file.clear();
    let mut new_tag = Tag::new(tagged_file.primary_tag_type());

    song_file
        .title
        .inspect(|title| new_tag.set_title(title.clone()));
    song_file
        .artist
        .inspect(|artist| new_tag.set_artist(artist.clone()));
    song_file
        .album
        .inspect(|album| new_tag.set_album(album.clone()));
    song_file
        .genre
        .inspect(|genre| new_tag.set_genre(genre.clone()));
    song_file.year.inspect(|year| {
        new_tag.set_year(*year);
        new_tag.insert_text(ItemKey::RecordingDate, year.to_string());
    });
    song_file
        .track_number
        .inspect(|track_number| new_tag.set_track(*track_number));

    if let Some(pic) = song_file.picture {
        let pic = normalize_cover_art(pic).map_err(|e| {
            Error::Common(format!(
                "Could not resize cover art for {}. {}",
                full_path, e
            ))
        })?;
        let new_pic = Picture::new_unchecked(
            PictureType::CoverFront,
            pic.mime_type.map(|mime| MimeType::from_str(&mime)),
            None, // description
            pic.data,
        );
        new_tag.push_picture(new_pic);
    }

    new_tag
        .save_to_path(&full_path, WriteOptions::default())
        .map_err(|e| Error::Common(format!("Cannot save tags to file {}", full_path)))?;
    Ok(())
}

#[tauri::command]
async fn download(
    xorname: String,
    file_name: Option<String>, // name with extension
    destination: String,       // directory to download to
    app: AppHandle,
) -> Result<FileMetadata, Error> {
    let xorname_bytes: [u8; 32] = hex::decode(xorname)
        .map_err(|e| Error::Common(format!("Invalid xorname: {}", e)))?[0..32]
        .try_into()
        .unwrap();
    let xorname = XorName(xorname_bytes);

    let data = app
        .try_state::<Mutex<Option<Safe>>>()
        .ok_or(Error::NotConnected)?
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)?
        .download(xorname)
        .await?;

    let size = data.len();
    let mut reader = std::io::Cursor::new(data);
    let tagged_file = TaggedFile::read_from(&mut reader, ParseOptions::default())
        .map_err(|e| Error::Common(format!("Cannot read file data for tagging : {}", e)))?;
    let data = reader.into_inner(); // get ownership back, avoid cloning data

    let mut metadata = FileMetadata::from_tagged_file(&tagged_file);
    metadata.size = Some(size as u32);
    metadata.xorname = Some(xorname.clone());
    metadata.folder_path = Some(destination.clone());
    metadata.picture = metadata
        .picture
        .map(|pic| {
            normalize_cover_art(pic).map_err(|e| {
                Error::Common(format!("Could not resize cover art for {}. {}", xorname, e))
            })
        })
        .transpose()?;

    let mut path = PathBuf::from(destination);
    if let Some(file_name) = file_name {
        let file_name = PathBuf::from(file_name);

        metadata.file_name = file_name
            .file_stem()
            .map(|s| String::from(s.to_string_lossy().as_ref()));
        metadata.extension = file_name
            .extension()
            .map(|s| String::from(s.to_string_lossy().as_ref()));

        path.push(file_name);
    } else {
        let filename_meta = metadata.clone();
        let mut songname_parts: Vec<String> = vec![];
        filename_meta
            .track_number
            .inspect(|track| songname_parts.push(format!("{:0>3}", track)));
        filename_meta.artist.inspect(|artist| {
            songname_parts.push(artist.replace(|c: char| !c.is_ascii_alphanumeric(), "_"))
        });
        filename_meta.title.inspect(|title| {
            songname_parts.push(title.replace(|c: char| !c.is_ascii_alphanumeric(), "_"))
        });

        let songname = songname_parts.join(" - ");
        let extension = String::from(match tagged_file.file_type() {
            FileType::Aac => "aac",
            FileType::Ape => "ape",
            FileType::Aiff => "aiff",
            FileType::Mpeg => "mp3",
            FileType::Flac => "flac",
            FileType::Mpc => "mpc",
            FileType::Opus => "opus",
            FileType::Speex => "spx",
            FileType::WavPack => "wv",
            FileType::Wav => "wav",
            FileType::Vorbis => "ogg",
            FileType::Mp4 => "m4a",
            _ => "",
        });

        metadata.file_name = Some(songname.clone());
        metadata.extension = Some(extension.clone());

        let mut filename_parts: Vec<String> = vec![];
        //        filename_parts.push(hex::encode(xorname));
        //        filename_parts.push("__".into());
        filename_parts.push(songname);
        filename_parts.push(String::from("."));
        filename_parts.push(extension);
        path.push(filename_parts.join(""));
    }

    fs::write(&path, data)
        .map_err(|_| Error::Common(format!("Could not save song: {}", path.display())))?;

    Ok(metadata)
}

// returns hex-encoded xorname
#[tauri::command]
async fn upload(
    file: String, // file path
    app: AppHandle,
) -> Result<String, Error> {
    let path = PathBuf::from(file);
    let data = fs::read(&path)
        .map_err(|e| Error::Common(format!("File {} is not readable: {}", path.display(), e)))?;
    put_data(data, app).await
}

// returns hex-encoded xorname
#[tauri::command]
async fn put_data(data: Vec<u8>, app: AppHandle) -> Result<String, Error> {
    let data_address = app
        .try_state::<Mutex<Option<Safe>>>()
        .ok_or(Error::NotConnected)?
        .lock()
        .await
        .as_mut()
        .ok_or(Error::NotConnected)? // safe
        .upload(&data)
        .await?;

    Ok(hex::encode(data_address))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .manage(Mutex::new(Session::new()))
        .invoke_handler(tauri::generate_handler![
            list_accounts,
            connect,
            sign_in,
            is_connected,
            disconnect,
            log_level,
            session_set,
            session_read,
            create_reg,
            read_reg,
            write_reg,
            client_address,
            balance,
            gas_balance,
            check_key,
            delete_account,
            get_file_metadata,
            save_file_metadata,
            download,
            upload,
            put_data,
        ])
        .setup(|app| {
            //            server::run(app.handle().clone()); // temporarily disable local server, because streaming from network is not implemented.
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
