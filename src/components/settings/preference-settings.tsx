import { ThemeToggler } from "../theme-toggler";
import SubDividerLayout from "@/enums/sub-divider-layout";
import SubDivider from "./sub-divider";
import LanguageSwitcher from "../language-switcher";
import { useTranslation } from "react-i18next";

export default function PreferenceSettings() {
    const { t } = useTranslation();

    return (
        <div className="items-center">
            <SubDivider title={t("theme")} layout={SubDividerLayout.TOP} />
            <div className="p-4">
                <ThemeToggler />
            </div>
            <SubDivider
                title={t("language")}
                layout={SubDividerLayout.DEFAULT}
            />
            <div className="p-4">
                <LanguageSwitcher />
            </div>
        </div>
    );
}
