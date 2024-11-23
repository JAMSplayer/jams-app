use serde::{Deserialize, Serialize};
use password_hash::SaltString;
use argon2::{Argon2, ParamsBuilder};
use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng}, Aes256Gcm
};
use safe::SecretKey;
use super::Error;

const AES_KEY_SIZE: usize = 32;
const ARGON2_ALGO: argon2::Algorithm = argon2::Algorithm::Argon2id;
const ARGON2_VER: argon2::Version = argon2::Version::V0x13;

const ARGON2_ALGO_ID_STR: &str = "Argon2id";
const ARGON2_VER_13_STR: &str = "V0x13";


#[derive(Debug, Serialize, Deserialize)]
enum PassHashAlgo {
    Argon2
}

#[derive(Debug, Serialize, Deserialize)]
struct SecretKeyFile {
    algorithm: PassHashAlgo,
    param_mcost: u32,
    param_tcost: u32,
    param_pcost: u32,
    param_algo: String,
    param_ver: String,
    salt: Vec<u8>,
    encrypted_sk: Vec<u8>,
}



pub fn encrypt(sk: SecretKey, password: &str) -> Result<Vec<u8>, Error> {

    let params = ParamsBuilder::new()
        .output_len(AES_KEY_SIZE)
        .build().unwrap();

    let argon2 = Argon2::new(
        ARGON2_ALGO,
        ARGON2_VER,
        params.clone());

    let salt = SaltString::generate(&mut OsRng);
    let mut aes_key = [0u8; AES_KEY_SIZE];
    argon2.hash_password_into(password.as_bytes(), salt.as_str().as_bytes(), &mut aes_key)
    	.map_err(|e| Error::Common(format!("Could not create key hash. {}", e)))?;

    let aes = Aes256Gcm::new_from_slice(&aes_key)
    	.map_err(|e| Error::Common(format!("Could not init cipher. {}", e)))?;
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let sk_bytes: &[u8] = &sk.to_bytes();
    let data = aes.encrypt(&nonce, sk_bytes)
    	.map_err(|e| Error::Common(format!("Could not encrypt secret key. {}", e)))?;
    let nonced_data = [&nonce, &data[..]].concat();

    let algo_str = match ARGON2_ALGO {
        argon2::Algorithm::Argon2id => String::from(ARGON2_ALGO_ID_STR),
        _ => { panic!("Unexpected Argon2 algorithm"); }
    };
    let ver_str = match ARGON2_VER {
        argon2::Version::V0x13 => String::from(ARGON2_VER_13_STR),
        _ => { panic!("Unexpected Argon2 version"); }
    };

    let skf = SecretKeyFile {
        algorithm: PassHashAlgo::Argon2,
        param_mcost: params.m_cost(),
        param_tcost: params.t_cost(),
        param_pcost: params.p_cost(),
        param_algo: algo_str,
        param_ver: ver_str,
        salt: Vec::from(salt.as_str()),
        encrypted_sk: Vec::from(nonced_data),
    };

    Ok(serde_json::to_vec(&skf).unwrap())
}

pub fn decrypt(file_bytes: &[u8], password: &str) -> Result<SecretKey, Error> {

    let skf: SecretKeyFile = serde_json::from_slice(file_bytes)
    	.map_err(|e| Error::Common(format!("Could not decode JSON. {}", e)))?;

    let params = ParamsBuilder::new()
        .m_cost(skf.param_mcost)
        .t_cost(skf.param_tcost)
        .p_cost(skf.param_pcost)
        .output_len(AES_KEY_SIZE)
        .build()
    	.map_err(|e| Error::Common(format!("Could not interpret cipher params. {}", e)))?;

    let algo = match skf.param_algo.as_str() {
        ARGON2_ALGO_ID_STR => argon2::Algorithm::Argon2id,
        _ => { panic!("Unexpected Argon2 algorithm"); }
    };
    let ver = match skf.param_ver.as_str() {
        ARGON2_VER_13_STR => argon2::Version::V0x13,
        _ => { panic!("Unexpected Argon2 version"); }
    };

    let argon2 = Argon2::new(algo, ver, params);

    let mut aes_key = [0u8; AES_KEY_SIZE];
    argon2.hash_password_into(password.as_bytes(), &skf.salt[..], &mut aes_key)
    	.map_err(|e| Error::Common(format!("Could not create key hash. {}", e)))?;

    let aes = Aes256Gcm::new_from_slice(&aes_key)
    	.map_err(|e| Error::Common(format!("Could not init cipher. {}", e)))?;
    let nonce = &skf.encrypted_sk[0..12];
    let data = &skf.encrypted_sk[12..];
    let sk_bytes: &[u8] = &aes.decrypt(nonce.into(), data)
    	.map_err(|_| Error::BadPassword)?
//    	.map_err(|e| Error::Common(format!("Could not decrypt secret key. {}", e)))?
    	[0..32];
    Ok(SecretKey::from_bytes(sk_bytes.try_into()
    	.map_err(|e| Error::Common(format!("Could not transform bytes representation. {}", e)))?)
    	.map_err(|e| Error::Common(format!("Could not create shared key. {}", e)))?)
}

