use futures::lock::Mutex;
use safe::{registers::XorNameBuilder, Safe, SecretKey};
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager, State};

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
async fn connect(mut app: AppHandle) -> Result<(), Error> {
    let state = app.try_state::<Mutex<Option<Safe>>>();
    if state.is_some() {
        if state.unwrap().lock().await.is_some() {
            println!("Already connected.");
        } else {
            println!("Already connecting...");
        }
        return Ok(());
    } else {
        app.manage(Mutex::new(None::<Safe>));
    }

    let main_window = app.get_webview_window("main").unwrap();
    main_window.set_title("JAMS: connecting...")?;

    let app_root = make_root(&mut app)?;

    // TODO: save sk to app state
    let sk = load_create_key(&app_root)?;
    println!("\n\nSecret Key: {}", &sk.to_hex());

    let mut peers = Vec::new();
    peers.push(
        "/ip4/127.0.0.1/udp/49619/quic-v1/p2p/12D3KooWRJsoqrDvNsUeQCTUXUqqEddhiAVfR5d7csqmGpxGCymJ"
            .parse()
            .unwrap(),
    );

    Safe::init_logging().map_err(|_| Error {
        message: format!("Safenet logging error, exiting."),
    })?;

    let connection_result = Safe::connect(peers, Some(sk), app_root.join("wallet")).await;
    if let Err(_) = connection_result {
        main_window.set_title("JAMS (not connected)")?;
    }
    let safe = connection_result?;
//    println!("Wallet address: {}", safe.address()?.to_hex());
    println!("ETH wallet address: {}", safe.address()?.to_string());

    println!("Connected.");
    *(app.state::<Mutex<Option<Safe>>>().lock().await) = Some(safe);

    main_window.set_title("JAMS (connected)")?;

    Ok(())
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
    let mut reg = safe
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

//#[tauri::command]
//async fn read_register(
//    name: Vec<String>,
//    safe: State<'_, Mutex<Option<Safe>>>,
//) -> Result<String, Error> {
//    let meta = meta_builder(name)?.build();
//
//    let mut reg = safe
//        .lock()
//        .await
//        .as_mut()
//        .ok_or(Error {
//            message: String::from("Not connected."),
//        })?
//        .open_register(meta)
//        .await?;
//
//    let data = Safe::read_register(&mut reg, 0)
//        .await?
//        .unwrap_or(Vec::new());
//
//    Ok(String::from_utf8(data).map_err(|e| Error {
//        message: format!("{e}"),
//    })?)
//}
//
//#[tauri::command]
//async fn write_register(
//    name: Vec<String>,
//    data: String,
//    safe: State<'_, Mutex<Option<Safe>>>,
//) -> Result<(), Error> {
//    println!("\n\nRegister write...");
//    println!("Name: {:?}", name);
//
//    let meta = meta_builder(name)?.build();
//    println!("Meta: {}", meta);
//
//    let mut reg = safe
//        .lock()
//        .await
//        .as_mut()
//        .ok_or(Error {
//            message: String::from("Not connected."),
//        })?
//        .open_register(meta)
//        .await?;
//
//    println!("\n\nRegister found: {:?}", reg);
//
//    println!("Writing data: {}", &data);
//    if !data.is_empty() {
//        Safe::register_write(&mut reg, data.as_bytes()).await?;
//
//        println!("\n\nRegister updated: {:?}", reg);
//    } else {
//        return Err(Error {
//            message: String::from("Empty data object string."),
//        });
//    }
//
//    Ok(())
//}
//
//#[tauri::command]
//async fn receive(transfer: String, safe: State<'_, Mutex<Option<Safe>>>) -> Result<(), Error> {
//    safe.lock()
//        .await
//        .as_mut()
//        .ok_or(Error {
//            message: String::from("Not connected."),
//        })?
//        .receive(transfer)
//        .await?;
//    Ok(())
//}

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            connect,
            create_register,
//            read_register,
//            write_register,
//            receive,
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
