use futures::lock::Mutex;
use lofty::file::AudioFile;
use lofty::prelude::ItemKey;
use lofty::prelude::TaggedFileExt;
use lofty::read_from_path;
use safe::{registers::XorNameBuilder, Safe, SecretKey};
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Emitter, Manager, State};

mod server;

#[derive(Debug, Serialize, Deserialize)]
struct Error {
    message: String,
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", &self.message)
    }
}

impl std::error::Error for Error {}

impl From<tauri::Error> for Error {
    fn from(tauri_error: tauri::Error) -> Self {
        Error {
            message: format!("Tauri: {}", tauri_error),
        }
    }
}

impl From<safe::Error> for Error {
    fn from(safe_error: safe::Error) -> Self {
        Error {
            message: format!("Safe: {}", safe_error),
        }
    }
}

fn make_root(app: &mut AppHandle) -> Result<PathBuf, Error> {
    let app_data = app.path().app_data_dir().map_err(|_| Error {
        message: format!("Could not get app data dir, exiting."),
    })?;
    fs::create_dir_all(&app_data).map_err(|_| Error {
        message: format!(
            "Could not create app data dir: {}, exiting.",
            &app_data.display()
        ),
    })?;

    Ok(app_data)
}

// TODO: store in a safe place, encrypted with password
fn load_create_key(app_root: &PathBuf) -> Result<SecretKey, Error> {
    let mut sk_file = app_root.clone();
    sk_file.push("sk.key");

    let not_readable_msg = format!(
        "Could not read user key file: {}, exiting.",
        &sk_file.display()
    );
    let sk = if sk_file.try_exists().map_err(|_| Error {
        message: not_readable_msg.clone(),
    })? {
        let bytes = fs::read(&sk_file).map_err(|_| Error {
            message: not_readable_msg.clone(),
        })?;

        let wrong_format_msg = format!(
            "Wrong format of user key file: {}, exiting.",
            &sk_file.display()
        );
        if bytes.len() == 32 {
            SecretKey::from_bytes(bytes[0..32].try_into().unwrap()).map_err(|_| Error {
                message: wrong_format_msg,
            })
        } else {
            Err(Error {
                message: wrong_format_msg,
            })
        }?
    } else {
        let sk = SecretKey::random();
        std::fs::write(sk_file.clone(), &sk.to_bytes()).map_err(|_| Error {
            message: format!(
                "Could not save user key file: {}, exiting.",
                &sk_file.display()
            ),
        })?;
        sk
    };

    Ok(sk)
}

#[tauri::command]
async fn disconnect(mut app: AppHandle) -> Result<(), Error> {
    app.unmanage::<Mutex<Option<Safe>>>().ok_or(Error {
        message: String::from("Not connected."),
    })?;

    app.emit("disconnect", ()).map_err(|_| Error {
        message: String::from("Event emit error."),
    })
}

fn meta_builder(name: Vec<String>) -> Result<XorNameBuilder, Error> {
    if name.is_empty() {
        return Err(Error {
            message: String::from("Empty register name."),
        });
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
        .ok_or(Error {
            message: String::from("Not connected."),
        })?
        .register_create(&data.as_bytes(), meta, None)
        .await?;

    println!("\n\nRegister created: {:?}", reg);
    //    println!("Costs: {}, {}", cost, royalties);

    //    Ok((reg.address().to_hex(), cost.as_nano(), royalties.as_nano()))
    Ok(reg.address().to_hex())
}

#[tauri::command]
async fn client_address(safe: State<'_, Mutex<Option<Safe>>>) -> Result<String, Error> {
    let address = safe
        .lock()
        .await
        .as_mut()
        .ok_or(Error {
            message: String::from("Not connected."),
        })?
        .address()?;
    Ok(address.to_string())
}

#[tauri::command]
async fn balance(safe: State<'_, Mutex<Option<Safe>>>) -> Result<String, Error> {
    let balance = safe
        .lock()
        .await
        .as_mut()
        .ok_or(Error {
            message: String::from("Not connected."),
        })?
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
    data: Vec<u8>,     // Image data
    mime_type: String, // MIME type of the image (e.g., image/jpeg)
}

#[tauri::command]
async fn get_file_metadata(file_paths: Vec<String>) -> Result<Vec<FileMetadata>, String> {
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
                    .unwrap_or_else(|| "unknown".to_string());
                let title = truncate_to_max_length(title, MAX_TITLE_LENGTH);

                let artist = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.get_string(&ItemKey::TrackArtist).map(String::from))
                    .unwrap_or_else(|| "unknown".to_string());
                let artist = truncate_to_max_length(artist, MAX_ARTIST_LENGTH);

                let album = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.get_string(&ItemKey::AlbumTitle).map(String::from))
                    .unwrap_or_else(|| "unknown".to_string());
                let album = truncate_to_max_length(album, MAX_ALBUM_LENGTH);

                let genre = tagged_file
                    .primary_tag()
                    .and_then(|tag| tag.get_string(&ItemKey::Genre).map(String::from))
                    .unwrap_or_else(|| "unknown".to_string());
                let genre = truncate_to_max_length(genre, MAX_GENRE_LENGTH);

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
                            pic.data().to_vec(), // Access the picture data using the `data()` method
                            pic.mime_type()
                                .map(|mime| mime.to_string())
                                .unwrap_or_else(|| "unknown".to_string()), // Safely handle Option<&MimeType>
                        )
                    });

                // Add file metadata to the list
                metadata_list.push(FileMetadata {
                    file_path,
                    title: Some(title),
                    artist: Some(artist),
                    album: Some(album),
                    genre: Some(genre),
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            disconnect,
            create_register,
            client_address,
            balance,
            get_file_metadata,
        ])
        .setup(|app| {
            server::run(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
