import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { ThemeToggler } from "../theme-toggler";
import AccountConnect from "../account/account-connect";
import { Link } from "react-router-dom";
import { SettingsIcon } from "lucide-react";

export function Navbar() {
    return (
        <header className="sticky top-0 z-10 w-full bg-background shadow dark:shadow-secondary">
            <div className="mx-4 sm:mx-8 flex h-14 items-center">
                <div className="flex items-center space-x-4 lg:space-x-0">
                    <SheetMenu />
                </div>
                <div className="flex flex-1 items-center justify-end gap-4">
                    <ThemeToggler />
                    <Link to="/settings">
                        <SettingsIcon strokeWidth={0.75} />
                    </Link>
                    <AccountConnect />
                </div>
            </div>
        </header>
    );
}
