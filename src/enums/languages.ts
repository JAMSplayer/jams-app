export enum Languages {
    English = "en",
    German = "de",
}

// This is the structure you had previously, but now using the Languages enum for the values
export const languageOptions = [
    { label: "English", value: Languages.English },
    { label: "German", value: Languages.German },
];
