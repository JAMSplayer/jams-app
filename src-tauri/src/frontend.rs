use crate::{Deserialize, Serialize, Error, XorName, PathBuf};


// stuff that has to be in sync with frontend code.

pub(crate) const USER_SESSION_KEY: &str = "user";

#[derive(Serialize)]
pub(crate) struct SimpleAccountUser {
    pub(crate) username: String,
    pub(crate) address: String,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub(crate) struct FileMetadata {
    pub(crate) folder_path: Option<String>,
    pub(crate) file_name: Option<String>,
    pub(crate) extension: Option<String>,
    pub(crate) xorname: Option<XorName>,
    pub(crate) size: Option<u32>,
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

impl FileMetadata {
    pub fn full_path(&self) -> Result<PathBuf, Error> {
        let mut path = PathBuf::from(
            self.folder_path.clone().ok_or(Error::Common("Cannot construct full path without folder_path.".into()))?);

        path.push(
            self.file_name.clone()
                .or_else(|| self.xorname.clone().map(hex::encode))
                .ok_or(Error::Common("Need file_name or xorname to construct full path.".into()))?
        );

        if let Some(ext) = self.extension.clone() {
            path.push(ext);
        }
        Ok(path)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub(crate) struct FilePicture {
    pub(crate) data: Vec<u8>,             // Image data
    pub(crate) mime_type: Option<String>, // MIME type of the image (e.g., image/jpeg)
}
