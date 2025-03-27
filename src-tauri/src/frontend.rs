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
            self.folder_path.clone()
                .ok_or(Error::Common("Need folder_path to construct full path.".into()))?
        );

        path.push(
            format!("{}.{}",

                self.file_name.clone()
                    .ok_or(Error::Common("Need file_name to construct full path.".into()))?,

                self.extension.clone()
                    .ok_or(Error::Common("Need extension to construct full path.".into()))?
            )
        );

        Ok(path)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub(crate) struct FilePicture {
    pub(crate) data: Vec<u8>,             // Image data
    pub(crate) mime_type: Option<String>, // MIME type of the image (e.g., image/jpeg)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn meta_full_path() {
        let meta = FileMetadata {
            folder_path: Some("/test/folder".into()),
            file_name: Some("file".into()),
            extension: Some("mp3".into()),
            ..Default::default()
        };
        assert_eq!(PathBuf::from("/test/folder/file.mp3"), meta.full_path().unwrap());
    }
}
