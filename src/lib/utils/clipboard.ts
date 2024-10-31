import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "sonner";

export async function copyToClipboard(value: string) {
    await writeText(value)
        .then(() => {
            toast("Text Copied", {
                description: "Your text is now ready for pasting.",
            });
        })
        .catch((err) => {
            console.error("Error copying text: ", err);
        });
}
