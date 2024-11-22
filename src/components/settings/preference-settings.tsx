import { ThemeToggler } from "../theme-toggler";
import SubDividerLayout from "@/enums/sub-divider-layout";
import SubDivider from "./sub-divider";
import LanguageSwitcher from "../language-switcher";

export default function PreferenceSettings() {
    return (
        <div className="items-center">
            <SubDivider title="Theme" layout={SubDividerLayout.TOP} />
            <div className="p-4">
                <ThemeToggler />
            </div>
            <SubDivider title="Language" layout={SubDividerLayout.DEFAULT} />
            <div className="p-4">
                <LanguageSwitcher />
            </div>
        </div>
    );
}
