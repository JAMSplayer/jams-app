import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en_translation from "./en/en_translation.json";
import de_translation from "./de/de_translation.json";
import es_translation from "./es/es_translation.json";
import hi_translation from "./hi/hi_translation.json";
import zh_translation from "./zh/zh_translation.json";

i18next.use(initReactI18next).init({
    lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",
    debug: true,
    resources: {
        en: {
            translation: en_translation,
        },
        de: {
            translation: de_translation,
        },
        es: {
            translation: es_translation,
        },
        hi: {
            translation: hi_translation,
        },
        zh: {
            translation: zh_translation,
        },
    },
    interpolation: {
        escapeValue: false, // React already escapes by default
    },
    // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
    // set returnNull to false (and also in the i18next.d.ts options)
    // returnNull: false,
});
