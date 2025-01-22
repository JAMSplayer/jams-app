import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export async function copyToClipboard(value: string) {
    const { t } = useTranslation();
    await writeText(value)
        .then(() => {
            toast(t("textCopied"), {
                description: t("yourTextIsNowReadyForPasting"),
            });
        })
        .catch((err) => {
            console.error("Error copying text: ", err);
        });
}
