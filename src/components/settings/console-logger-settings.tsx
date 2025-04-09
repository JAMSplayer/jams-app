import SubDivider from "./sub-divider";
import SubDividerLayout from "@/enums/sub-divider-layout";
import { useTranslation } from "react-i18next";
import ConsoleLogger from "../console-logger";

export default function ConsoleLoggerSettings() {
    const { t } = useTranslation();

    return (
        <div className="items-center">
            <SubDivider
                title={t("consoleLogger")}
                layout={SubDividerLayout.TOP}
            />

            <ConsoleLogger />
        </div>
    );
}
