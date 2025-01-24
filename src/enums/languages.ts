export enum Languages {
    English = "en",
    German = "de",
    Spanish = "es",
    Chinese = "zh",
    Hindi = "hi",
}

// This is the structure you had previously, but now using the Languages enum for the values
export const languageOptions = [
    { label: "English", value: Languages.English },
    { label: "German", value: Languages.German },
    { label: "Spanish", value: Languages.Spanish },
    { label: "Chinese", value: Languages.Chinese },
    { label: "Hindi", value: Languages.Hindi },
];
