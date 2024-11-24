import { useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import TopLevelBreadcrumbs from "@/components/navigation/top-level-breadcrumbs";
import SecondaryLevelBreadcrumbs from "@/components/navigation/secondary-level-breadcrumbs";

const secondaryNavigation = [
    { name: "Status", href: "/settings/status", current: false },
    { name: "Storage", href: "/settings/storage", current: false },
    { name: "Notifications", href: "/settings/notifications", current: false },
    { name: "Preferences", href: "/settings/preference", current: false },
];

export default function Settings() {
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize pages with default settings page
    const [pages, setPages] = useState([{ name: "Settings", current: true }]);

    // Use effect to navigate to StatusSettings when the component mounts
    useEffect(() => {
        // Determine the active secondary navigation item based on current location
        const currentNavItem = secondaryNavigation.find(
            (item) => item.href === location.pathname
        );
        // Update pages state
        if (currentNavItem) {
            setPages([{ name: "Settings", current: true }, currentNavItem]);
        } else {
            setPages([{ name: "Settings", current: true }]);
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
