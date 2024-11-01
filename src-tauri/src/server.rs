use tauri::path::BaseDirectory;
use tauri::AppHandle;
use tauri::Manager;
use warp::{Filter, http::Response};


fn autonomi(path: String) -> Result<String, String> {
	// e.g. 3509bad03dc869dec883c7b44662c3503d2517fa9e828bb64f4dbe719d3837bf__BegBlag.mp3
    let xor = path.get(..64).ok_or(String::from("Error parsing URL"))?;
    let filename = path.get(66..).ok_or(String::from("Error parsing URL"))?;
    println!("{} : {}", xor, filename);
    Ok(String::from(xor))
}

fn data(_path: String, app: &AppHandle) -> Result<Vec<u8>, String> {
	let resource_path = app.path().resolve("resources/A_Lazy_Farmer_Boy_by_Buster_Carter_And_Preston_Young.mp3", BaseDirectory::Resource).or(Err(String::from("Error getting resources")))?;
	println!("RES{:?}", resource_path);

    std::fs::read(resource_path).or(Err("Error reading file".to_string()))
}

pub fn run(app: AppHandle) {
	tauri::async_runtime::spawn(async {
		warp::serve(warp::path::param::<String>().map(move |path| {
			Response::new(data(path, &app).unwrap())
		}))
		.run(([127, 0, 0, 1], 12345))
		.await;
	});
}
