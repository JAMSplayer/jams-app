use tauri::path::BaseDirectory;
use tauri::AppHandle;
use tauri::Manager;
use warp::{Filter, http::Response};
use safe::RegisterAddress;


fn autonomi(path: String) -> Result<RegisterAddress, String> {
	// e.g. 08dbb205f5a5712e48551c0e437f07be304a5daadf20e07e8307e7f564fa9962823aacdc081a17136c4e09f82a29ac50dba22dbc898a41b5d68d4971dc9b62ad5d82ef0e5f9d7b2224eb285497489d4a__BegBlag.mp3
    let filename = path.get(162..).ok_or(String::from("Error parsing URL"))?;
    let address = path.get(..160).ok_or(String::from("Error parsing URL"))?;
    println!("{address}");
    let address = RegisterAddress::from_hex(address)
    	.map_err(|_| format!("Error parsing RegisterAddress: {address}"))?;
    println!("{} : {}", address, filename);
    println!("{:?} : {}", address, filename);
//    println!("{:x} : {}", xor, filename);
    Ok(address)
}

fn data(_path: String, app: &AppHandle) -> Result<Vec<u8>, String> {
	let resource_path = app.path().resolve("resources/A_Lazy_Farmer_Boy_by_Buster_Carter_And_Preston_Young.mp3", BaseDirectory::Resource).or(Err("Error getting resources".to_string()))?;
	println!("RES{:?}", resource_path);

    std::fs::read(resource_path).or(Err("Error reading file".to_string()))
}

pub fn run(app: AppHandle) {
	tauri::async_runtime::spawn(async {
		warp::serve(warp::path::param::<String>().map(move |path: String| {
			let _ = autonomi(path.clone()).inspect_err(|e| println!("Error: {e}"));
			Response::new(data(path, &app).unwrap())
		}))
		.run(([127, 0, 0, 1], 12345))
		.await;
	});
}
