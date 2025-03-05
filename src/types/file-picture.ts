export type FilePicture = {
    data: Uint8Array; // Corresponds to Vec<u8> returned from rust
    mime_type: string; // Corresponds to String returned from rust
};
