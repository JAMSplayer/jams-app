use crate::{Deserialize, Serialize};

// stuff that has to be in sync with frontend code.

pub(crate) const USER_SESSION_KEY: &str = "user";

#[derive(Serialize)]
pub(crate) struct SimpleAccountUser {
    pub(crate) username: String,
    pub(crate) address: String,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub(crate) struct FileMetadata {
    pub(crate) file_path: String,
    pub(crate) title: Option<String>,
    pub(crate) artist: Option<String>,
    pub(crate) album: Option<String>,
    pub(crate) genre: Option<String>,
    pub(crate) year: Option<u32>,
    pub(crate) track_number: Option<u32>,
    pub(crate) duration: Option<u64>,        // Duration in seconds
    pub(crate) channels: Option<u8>,         // Optional
    pub(crate) sample_rate: Option<u32>,     // Optional
    pub(crate) picture: Option<FilePicture>, // Use FilePicture struct for image and MIME type
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub(crate) struct FilePicture {
    pub(crate) data: Vec<u8>,             // Image data
    pub(crate) mime_type: Option<String>, // MIME type of the image (e.g., image/jpeg)
}
