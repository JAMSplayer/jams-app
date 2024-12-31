import { useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import TopLevelBreadcrumbs from "@/components/navigation/top-level-breadcrumbs";
import SecondaryLevelBreadcrumbs from "@/components/navigation/secondary-level-breadcrumbs";
import { useTranslation } from "react-i18next";

export default function Settings() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const secondaryNavigation = [
        { name: t("status"), href: "/settings/status", current: false },
        { name: t("storage"), href: "/settings/storage", current: false },
        {
            name: t("notifications"),
            href: "/settings/notifications",
            current: false,
        },
        {
            name: t("preferences"),
            href: "/settings/preference",
            current: false,
        },
        { name: t("network"), href: "/settings/network", current: false },
    ];

    // Initialize pages with default settings page
    const [pages, setPages] = useState([
        { name: t("settings"), current: true },
    ]);

    // Use effect to navigate to StatusSettings when the component mounts
    useEffect(() => {
        // Determine the active secondary navigation item based on current location
        const currentNavItem = secondaryNavigation.find(
            (item) => item.href === location.pathname
        );
        // Update pages state
        if (currentNavItem) {
            setPages([{ name: t("settings"), current: true }, currentNavItem]);
        } else {
            setPages([{ name: t("settings"), current: true }]);
        }

        // Check if the current path is not set, then navigate to status by default
        if (location.pathname === "/settings") {
            navigate("/settings/status"); // Navigate to status settings by default
        }
    }, [location.pathname, navigate]);

    return (
        <>
            <TopLevelBreadcrumbs pages={pages} />

            <SecondaryLevelBreadcrumbs pages={secondaryNavigation} />

            {/* This will render the current route's component */}
            <Outlet />
        </>
    );
}
