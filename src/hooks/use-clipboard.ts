import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useClipboard() {
    const { t } = useTranslation();

    const copyToClipboard = async (value: string) => {
        try {
            await writeText(value);
            toast(t("textCopied"), {
                description: t("yourTextIsNowReadyForPasting"),
            });
        } catch (err) {
            console.error("Error copying text: ", err);
        }
    };

    return { copyToClipboard };
}
