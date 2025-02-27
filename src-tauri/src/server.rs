use safe::XorName;
use std::{path::PathBuf};
use tauri::path::BaseDirectory;
use tauri::AppHandle;
use tauri::Manager;
use warp::{http::Response, Filter};

pub(crate) fn autonomi(path: &str) -> Result<(XorName, PathBuf), String> {
    // e.g. 08dbb205f5a5712e48551c0e437f07be304a5daadf20e07e8307e7f564fa9962__BegBlag.mp3
    let filename = path.get(66..).ok_or(String::from("Error parsing URL"))?;
    let address = path.get(..64).ok_or(String::from("Error parsing URL"))?;
    println!("{address}");
    let xorname_bytes: [u8; 32] = hex::decode(address)
        .map_err(|e| format!("Invalid xorname: {}", e))?[0..32]
        .try_into()
        .unwrap();
    let xorname = XorName(xorname_bytes);

    println!("{} : {}", xorname, filename);
    println!("{:?} : {}", xorname, filename);
    println!("{:x} : {}", xorname, filename);
    Ok((xorname, String::from(filename).into()))
}

fn data(_path: String, app: &AppHandle) -> Result<Vec<u8>, String> {
    let resource_path = app
        .path()
        .resolve(
            "resources/A_Lazy_Farmer_Boy_by_Buster_Carter_And_Preston_Young.mp3",
            BaseDirectory::Resource,
        )
        .or(Err("Error getting resources".to_string()))?;
    println!("RES{:?}", resource_path);

    std::fs::read(resource_path).or(Err("Error reading file".to_string()))
}

pub fn run(app: AppHandle) {
    tauri::async_runtime::spawn(async {
        warp::serve(warp::path::param::<String>().map(move |path: String| {
            let _ = autonomi(&path).inspect_err(|e| println!("Error: {e}"));
            Response::new(data(path, &app).unwrap())
        }))
        .run(([127, 0, 0, 1], 12345))
        .await;
    });
}
