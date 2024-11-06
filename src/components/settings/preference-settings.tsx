import { ThemeToggler } from "../ThemeToggler";
import SubDividerLayout from "@/enums/sub-divider-layout";
import SubDivider from "./sub-divider";

export default function PreferenceSettings() {
    return (
        <div className="items-center">
            <SubDivider title="Theme" layout={SubDividerLayout.TOP} />
            <div className="p-4">
                <ThemeToggler />
            </div>
        </div>
    );
}
